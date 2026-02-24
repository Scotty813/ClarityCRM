"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/lib/supabase/active-org";
import type { DealStage } from "@/lib/types/database";
import type {
  DashboardDeal,
  DashboardActivity,
  DashboardTask,
  DashboardData,
} from "@/lib/dashboard";

export async function getDashboardData(): Promise<DashboardData> {
  const { orgId, userId } = await getActiveOrganization();
  const supabase = await createClient();

  const [
    { data: profile },
    { data: org },
    { data: deals },
    { data: activities },
    { data: tasks },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single(),
    supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single(),
    supabase
      .from("deals")
      .select("id, name, value, stage, expected_close_date, updated_at, companies(name)")
      .eq("organization_id", orgId),
    supabase
      .from("deal_activities")
      .select("id, deal_id, activity_type, content, metadata, created_at, profiles(full_name), deals(name)")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("deal_tasks")
      .select("id, deal_id, title, due_date, deals(name)")
      .eq("organization_id", orgId)
      .eq("completed", false)
      .order("due_date", { ascending: true })
      .limit(20),
  ]);

  const enrichedDeals: DashboardDeal[] = (deals ?? []).map((d) => {
    const company = d.companies as unknown as { name: string } | null;
    return {
      id: d.id,
      name: d.name,
      value: d.value,
      stage: d.stage,
      expected_close_date: d.expected_close_date,
      updated_at: d.updated_at,
      company_name: company?.name ?? null,
    };
  });

  const enrichedActivities: DashboardActivity[] = (activities ?? []).map((a) => {
    const author = a.profiles as unknown as { full_name: string | null } | null;
    const deal = a.deals as unknown as { name: string } | null;
    return {
      id: a.id,
      activity_type: a.activity_type,
      content: a.content,
      metadata: a.metadata as Record<string, unknown> | null,
      created_at: a.created_at,
      author_name: author?.full_name ?? null,
      deal_id: a.deal_id,
      deal_name: deal?.name ?? null,
    };
  });

  const enrichedTasks: DashboardTask[] = (tasks ?? []).map((t) => {
    const deal = t.deals as unknown as { name: string } | null;
    return {
      id: t.id,
      title: t.title,
      due_date: t.due_date,
      deal_id: t.deal_id,
      deal_name: deal?.name ?? null,
    };
  });

  // Compute KPIs
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const activeDealStages: DealStage[] = ["qualified", "proposal", "negotiation"];

  const pipelineValue = enrichedDeals
    .filter((d) => activeDealStages.includes(d.stage))
    .reduce((sum, d) => sum + (d.value ?? 0), 0);

  const openDeals = enrichedDeals.filter((d) =>
    activeDealStages.includes(d.stage)
  ).length;

  const wonThisMonth = enrichedDeals
    .filter(
      (d) =>
        d.stage === "won" && new Date(d.updated_at) >= monthStart
    )
    .reduce((sum, d) => sum + (d.value ?? 0), 0);

  const closingSoon = enrichedDeals.filter((d) => {
    if (!activeDealStages.includes(d.stage)) return false;
    if (!d.expected_close_date) return false;
    const closeDate = new Date(d.expected_close_date);
    return closeDate <= fourteenDaysFromNow && closeDate >= now;
  }).length;

  return {
    userName: profile?.full_name ?? null,
    orgName: org?.name ?? null,
    deals: enrichedDeals,
    activities: enrichedActivities,
    tasks: enrichedTasks,
    kpis: {
      pipelineValue,
      openDeals,
      wonThisMonth,
      closingSoon,
    },
  };
}
