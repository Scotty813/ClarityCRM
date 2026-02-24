"use server";

import { createClient } from "@/lib/supabase/server";
import { tryAuthorize } from "@/lib/supabase/authorize";
import type {
  DealWithRelations,
  DealActivityWithAuthor,
  DealTask,
  SelectOption,
  ContactSelectOption,
} from "@/lib/types/database";

export async function getDealDetail(dealId: string) {
  const result = await tryAuthorize("deal:edit");
  if (!result.authorized) {
    return { success: false as const, error: result.error };
  }

  const { orgId, userId, role } = result.context;
  const supabase = await createClient();

  const [
    { data: deal },
    { data: activities },
    { data: tasks },
  ] = await Promise.all([
    supabase
      .from("deals")
      .select(
        "*, contacts(first_name, last_name, email), companies(name), owner:profiles!deals_owner_id_fkey(full_name, avatar_url)"
      )
      .eq("id", dealId)
      .eq("organization_id", orgId)
      .single(),
    supabase
      .from("deal_activities")
      .select("*, profiles(full_name)")
      .eq("deal_id", dealId)
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("deal_tasks")
      .select("*")
      .eq("deal_id", dealId)
      .eq("organization_id", orgId)
      .order("created_at", { ascending: true }),
  ]);

  if (!deal) {
    return { success: false as const, error: "Deal not found" };
  }

  const contact = deal.contacts as unknown as {
    first_name: string;
    last_name: string;
    email: string | null;
  } | null;
  const company = deal.companies as unknown as { name: string } | null;
  const owner = deal.owner as unknown as {
    full_name: string | null;
    avatar_url: string | null;
  } | null;

  const enrichedDeal: DealWithRelations = {
    ...deal,
    contact_name: contact
      ? `${contact.first_name} ${contact.last_name}`
      : null,
    company_name: company?.name ?? null,
    owner_name: owner?.full_name ?? null,
    owner_avatar_url: owner?.avatar_url ?? null,
    last_activity_at: (activities && activities.length > 0)
      ? activities[0].created_at
      : null,
    next_task_title: null,
    next_task_due_date: null,
  };

  const enrichedActivities: DealActivityWithAuthor[] = (activities ?? []).map(
    (a) => {
      const profile = a.profiles as unknown as {
        full_name: string | null;
      } | null;
      return {
        ...a,
        author_name: profile?.full_name ?? null,
      };
    }
  );

  return {
    success: true as const,
    deal: enrichedDeal,
    activities: enrichedActivities,
    tasks: (tasks ?? []) as DealTask[],
    contactEmail: contact?.email ?? null,
    currentUserId: userId,
    currentUserRole: role,
  };
}

export async function getDealFieldOptions() {
  const result = await tryAuthorize("deal:edit");
  if (!result.authorized) {
    return { success: false as const, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  const [{ data: contacts }, { data: members }] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, first_name, last_name, company_id, companies(name)")
      .eq("organization_id", orgId)
      .order("last_name", { ascending: true }),
    supabase
      .from("organization_users")
      .select("user_id, profiles(full_name)")
      .eq("organization_id", orgId),
  ]);

  const contactOptions: ContactSelectOption[] = (contacts ?? []).map((c) => {
    const company = c.companies as unknown as { name: string } | null;
    return {
      id: c.id,
      name: `${c.first_name} ${c.last_name}`,
      company_id: c.company_id,
      company_name: company?.name ?? null,
    };
  });

  const memberOptions: SelectOption[] = (members ?? []).map((m) => {
    const profile = m.profiles as unknown as { full_name: string | null };
    return {
      id: m.user_id,
      name: profile?.full_name ?? "Unknown",
    };
  });

  return {
    success: true as const,
    contacts: contactOptions,
    members: memberOptions,
  };
}
