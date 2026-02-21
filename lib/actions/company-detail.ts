"use server";

import { createClient } from "@/lib/supabase/server";
import { tryAuthorize } from "@/lib/supabase/authorize";
import type {
  CompanyWithRelations,
  Contact,
  DealWithRelations,
  DealActivityWithAuthor,
  SelectOption,
} from "@/lib/types/database";

export async function getCompanyDetail(companyId: string) {
  const result = await tryAuthorize("company:edit");
  if (!result.authorized) {
    return { success: false as const, error: result.error };
  }

  const { orgId, userId, role } = result.context;
  const supabase = await createClient();

  const [
    { data: company },
    { data: contacts },
    { data: deals },
    { data: activities },
    { data: tags },
  ] = await Promise.all([
    supabase
      .from("companies")
      .select(
        "*, owner:profiles!companies_owner_id_fkey(full_name, avatar_url)"
      )
      .eq("id", companyId)
      .eq("organization_id", orgId)
      .single(),
    supabase
      .from("contacts")
      .select("id, first_name, last_name, email, job_title")
      .eq("company_id", companyId)
      .eq("organization_id", orgId)
      .order("last_name", { ascending: true }),
    supabase
      .from("deals")
      .select(
        "*, owner:profiles!deals_owner_id_fkey(full_name, avatar_url)"
      )
      .eq("company_id", companyId)
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("deal_activities")
      .select("*, profiles(full_name)")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("company_tags")
      .select("tag_id, tags(id, name, color)")
      .eq("company_id", companyId),
  ]);

  if (!company) {
    return { success: false as const, error: "Company not found" };
  }

  const owner = company.owner as unknown as {
    full_name: string | null;
    avatar_url: string | null;
  } | null;

  // Filter activities to only those belonging to this company's deals
  const dealIds = new Set((deals ?? []).map((d) => d.id));
  const companyActivities = (activities ?? []).filter((a) =>
    dealIds.has(a.deal_id)
  );

  const enrichedActivities: DealActivityWithAuthor[] = companyActivities.map(
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

  const enrichedDeals: DealWithRelations[] = (deals ?? []).map((d) => {
    const dealOwner = d.owner as unknown as {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
    const lastActivity = companyActivities.find((a) => a.deal_id === d.id);
    return {
      ...d,
      contact_name: null,
      company_name: company.name,
      owner_name: dealOwner?.full_name ?? null,
      owner_avatar_url: dealOwner?.avatar_url ?? null,
      last_activity_at: lastActivity?.created_at ?? null,
      next_task_title: null,
      next_task_due_date: null,
    };
  });

  const companyTags = (tags ?? []).map((ct) => {
    const tag = ct.tags as unknown as {
      id: string;
      name: string;
      color: string;
    };
    return tag;
  });

  const enrichedCompany: CompanyWithRelations = {
    ...company,
    owner_name: owner?.full_name ?? null,
    owner_avatar_url: owner?.avatar_url ?? null,
    open_deals_count: (deals ?? []).filter((d) =>
      ["qualified", "proposal", "negotiation"].includes(d.stage)
    ).length,
    pipeline_value: (deals ?? [])
      .filter((d) => ["qualified", "proposal", "negotiation"].includes(d.stage))
      .reduce((sum, d) => sum + (d.value ? Number(d.value) : 0), 0),
    contact_count: contacts?.length ?? 0,
    last_activity_at: companyActivities[0]?.created_at ?? null,
    next_task_title: null,
    next_task_due_date: null,
    tags: companyTags,
  };

  return {
    success: true as const,
    company: enrichedCompany,
    contacts: (contacts ?? []) as Contact[],
    deals: enrichedDeals,
    activities: enrichedActivities,
    currentUserId: userId,
    currentUserRole: role,
  };
}

export async function getCompanyFieldOptions() {
  const result = await tryAuthorize("company:edit");
  if (!result.authorized) {
    return { success: false as const, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  const [{ data: members }, { data: tags }] = await Promise.all([
    supabase
      .from("organization_users")
      .select("user_id, profiles(full_name)")
      .eq("organization_id", orgId),
    supabase
      .from("tags")
      .select("id, name, color")
      .eq("organization_id", orgId)
      .order("name", { ascending: true }),
  ]);

  const memberOptions: SelectOption[] = (members ?? []).map((m) => {
    const profile = m.profiles as unknown as { full_name: string | null };
    return {
      id: m.user_id,
      name: profile?.full_name ?? "Unknown",
    };
  });

  return {
    success: true as const,
    members: memberOptions,
    tags: tags ?? [],
  };
}
