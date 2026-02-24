import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/lib/supabase/active-org";
import { DealsView } from "@/components/app/deals/deals-view";
import type { DealWithRelations } from "@/lib/types/database";

export default async function DealsPage() {
  const supabase = await createClient();
  const { orgId, userId } = await getActiveOrganization();

  const [
    { data: deals },
    { data: contacts },
    { data: companies },
    { data: members },
    { data: activities },
    { data: tasks },
  ] = await Promise.all([
    supabase
      .from("deals")
      .select(
        "*, contacts(first_name, last_name), companies(name), owner:profiles!deals_owner_id_fkey(full_name, avatar_url)"
      )
      .eq("organization_id", orgId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("contacts")
      .select("id, first_name, last_name, email, company_id")
      .eq("organization_id", orgId)
      .order("last_name", { ascending: true }),
    supabase
      .from("companies")
      .select("id, name")
      .eq("organization_id", orgId)
      .order("name", { ascending: true }),
    supabase
      .from("organization_users")
      .select("user_id, profiles(full_name, avatar_url)")
      .eq("organization_id", orgId),
    // Latest activity per deal
    supabase
      .from("deal_activities")
      .select("deal_id, created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    // All incomplete tasks ordered by due date
    supabase
      .from("deal_tasks")
      .select("deal_id, title, due_date")
      .eq("organization_id", orgId)
      .eq("completed", false)
      .order("due_date", { ascending: true, nullsFirst: false }),
  ]);

  // Build lookup maps for last activity and next task per deal
  const lastActivityMap = new Map<string, string>();
  for (const a of activities ?? []) {
    if (!lastActivityMap.has(a.deal_id)) {
      lastActivityMap.set(a.deal_id, a.created_at);
    }
  }

  const nextTaskMap = new Map<
    string,
    { title: string; due_date: string | null }
  >();
  for (const t of tasks ?? []) {
    if (!nextTaskMap.has(t.deal_id)) {
      nextTaskMap.set(t.deal_id, { title: t.title, due_date: t.due_date });
    }
  }

  const enriched: DealWithRelations[] = (deals ?? []).map((d) => {
    const contact = d.contacts as unknown as {
      first_name: string;
      last_name: string;
    } | null;
    const company = d.companies as unknown as { name: string } | null;
    const owner = d.owner as unknown as {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
    const nextTask = nextTaskMap.get(d.id);
    return {
      ...d,
      contact_name: contact
        ? `${contact.first_name} ${contact.last_name}`
        : null,
      company_name: company?.name ?? null,
      owner_name: owner?.full_name ?? null,
      owner_avatar_url: owner?.avatar_url ?? null,
      last_activity_at: lastActivityMap.get(d.id) ?? null,
      next_task_title: nextTask?.title ?? null,
      next_task_due_date: nextTask?.due_date ?? null,
    };
  });

  const memberOptions = (members ?? []).map((m) => {
    const profile = m.profiles as unknown as {
      full_name: string | null;
      avatar_url: string | null;
    };
    return {
      id: m.user_id,
      name: profile?.full_name ?? "Unknown",
      avatar_url: profile?.avatar_url ?? null,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <DealsView
        deals={enriched}
        contacts={
          contacts?.map((c) => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`,
            email: c.email,
            company_id: c.company_id,
          })) ?? []
        }
        companies={companies ?? []}
        members={memberOptions}
        currentUserId={userId}
      />
    </div>
  );
}
