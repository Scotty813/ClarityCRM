import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/lib/supabase/active-org";
import { CompaniesView } from "@/components/app/companies/companies-view";
import type { CompanyWithRelations } from "@/lib/types/database";

export default async function CompaniesPage() {
  const supabase = await createClient();
  const { orgId, userId } = await getActiveOrganization();

  const [
    { data: companies },
    { data: members },
    { data: deals },
    { data: contacts },
    { data: activities },
    { data: tasks },
    { data: companyTags },
  ] = await Promise.all([
    supabase
      .from("companies")
      .select(
        "*, owner:profiles!companies_owner_id_fkey(full_name, avatar_url)"
      )
      .eq("organization_id", orgId)
      .order("name", { ascending: true }),
    supabase
      .from("organization_users")
      .select("user_id, profiles(full_name, avatar_url)")
      .eq("organization_id", orgId),
    supabase
      .from("deals")
      .select("id, company_id, stage, value")
      .eq("organization_id", orgId),
    supabase
      .from("contacts")
      .select("id, company_id")
      .eq("organization_id", orgId),
    supabase
      .from("deal_activities")
      .select("deal_id, created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("deal_tasks")
      .select("deal_id, title, due_date")
      .eq("organization_id", orgId)
      .eq("completed", false)
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("company_tags")
      .select("company_id, tags(id, name, color)"),
  ]);

  // Build deal → company lookup maps
  const openStages = new Set(["qualified", "proposal", "negotiation"]);

  const openDealsByCompany = new Map<string, number>();
  const pipelineByCompany = new Map<string, number>();
  const dealIdToCompany = new Map<string, string>();

  for (const d of deals ?? []) {
    if (!d.company_id) continue;
    dealIdToCompany.set(d.id, d.company_id);
    if (openStages.has(d.stage)) {
      openDealsByCompany.set(
        d.company_id,
        (openDealsByCompany.get(d.company_id) ?? 0) + 1
      );
      pipelineByCompany.set(
        d.company_id,
        (pipelineByCompany.get(d.company_id) ?? 0) +
          (d.value ? Number(d.value) : 0)
      );
    }
  }

  // Contact counts by company
  const contactsByCompany = new Map<string, number>();
  for (const c of contacts ?? []) {
    if (!c.company_id) continue;
    contactsByCompany.set(
      c.company_id,
      (contactsByCompany.get(c.company_id) ?? 0) + 1
    );
  }

  // Last activity per company (through deals)
  const lastActivityByCompany = new Map<string, string>();
  for (const a of activities ?? []) {
    const companyId = dealIdToCompany.get(a.deal_id);
    if (!companyId || lastActivityByCompany.has(companyId)) continue;
    lastActivityByCompany.set(companyId, a.created_at);
  }

  // Next task per company (through deals)
  const nextTaskByCompany = new Map<
    string,
    { title: string; due_date: string | null }
  >();
  for (const t of tasks ?? []) {
    const companyId = dealIdToCompany.get(t.deal_id);
    if (!companyId || nextTaskByCompany.has(companyId)) continue;
    nextTaskByCompany.set(companyId, {
      title: t.title,
      due_date: t.due_date,
    });
  }

  // Tags by company
  const tagsByCompany = new Map<
    string,
    { id: string; name: string; color: string }[]
  >();
  for (const ct of companyTags ?? []) {
    const tag = ct.tags as unknown as {
      id: string;
      name: string;
      color: string;
    };
    if (!tag) continue;
    const existing = tagsByCompany.get(ct.company_id) ?? [];
    existing.push(tag);
    tagsByCompany.set(ct.company_id, existing);
  }

  // Enrich companies
  const enriched: CompanyWithRelations[] = (companies ?? []).map((c) => {
    const owner = c.owner as unknown as {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
    const nextTask = nextTaskByCompany.get(c.id);
    return {
      ...c,
      owner_name: owner?.full_name ?? null,
      owner_avatar_url: owner?.avatar_url ?? null,
      open_deals_count: openDealsByCompany.get(c.id) ?? 0,
      pipeline_value: pipelineByCompany.get(c.id) ?? 0,
      contact_count: contactsByCompany.get(c.id) ?? 0,
      last_activity_at: lastActivityByCompany.get(c.id) ?? null,
      next_task_title: nextTask?.title ?? null,
      next_task_due_date: nextTask?.due_date ?? null,
      tags: tagsByCompany.get(c.id) ?? [],
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
      <CompaniesView
        companies={enriched}
        members={memberOptions}
        currentUserId={userId}
        totalCount={companies?.length ?? 0}
      />
    </div>
  );
}
