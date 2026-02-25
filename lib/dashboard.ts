import { STAGE_LABELS } from "@/lib/deals";
import { isStale } from "@/lib/format";
import type { DealStage, DealActivityType } from "@/lib/types/database";

export interface DashboardDeal {
  id: string;
  name: string;
  value: number | null;
  stage: DealStage;
  expected_close_date: string | null;
  updated_at: string;
  company_name: string | null;
}

export interface DashboardActivity {
  id: string;
  activity_type: DealActivityType;
  content: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  author_name: string | null;
  deal_id: string;
  deal_name: string | null;
}

export interface DashboardTask {
  id: string;
  title: string;
  due_date: string | null;
  deal_id: string;
  deal_name: string | null;
}

export interface PipelineStageData {
  stage: string;
  value: number;
  count: number;
  fill: string;
}

export interface StaleDeal {
  id: string;
  name: string;
  stage: DealStage;
  lastActivityAt: string | null;
}

export interface DashboardKPIs {
  pipelineValue: number;
  openDeals: number;
  wonThisMonth: number;
  closingSoon: number;
}

export interface DashboardData {
  userName: string | null;
  orgName: string | null;
  deals: DashboardDeal[];
  activities: DashboardActivity[];
  tasks: DashboardTask[];
  kpis: DashboardKPIs;
}

const STAGE_COLORS: Record<string, string> = {
  qualified: "var(--chart-1)",
  proposal: "var(--chart-2)",
  negotiation: "var(--chart-3)",
};

export function getPipelineChartData(
  deals: { stage: DealStage; value: number | null }[]
): PipelineStageData[] {
  const activeStages: DealStage[] = ["qualified", "proposal", "negotiation"];
  const stageMap = new Map<string, { value: number; count: number }>();

  for (const stage of activeStages) {
    stageMap.set(stage, { value: 0, count: 0 });
  }

  for (const deal of deals) {
    if (!activeStages.includes(deal.stage)) continue;
    const entry = stageMap.get(deal.stage)!;
    entry.value += deal.value ?? 0;
    entry.count += 1;
  }

  return activeStages.map((stage) => ({
    stage: STAGE_LABELS[stage],
    value: stageMap.get(stage)!.value,
    count: stageMap.get(stage)!.count,
    fill: STAGE_COLORS[stage],
  }));
}

export function getStaleDealData(
  deals: DashboardDeal[],
  activities: { deal_id: string; created_at: string }[]
): StaleDeal[] {
  const activeDealStages: DealStage[] = ["qualified", "proposal", "negotiation"];

  const lastActivityByDeal = new Map<string, string>();
  for (const a of activities) {
    const existing = lastActivityByDeal.get(a.deal_id);
    if (!existing || a.created_at > existing) {
      lastActivityByDeal.set(a.deal_id, a.created_at);
    }
  }

  return deals
    .filter((d) => activeDealStages.includes(d.stage))
    .map((d) => ({
      id: d.id,
      name: d.name,
      stage: d.stage,
      lastActivityAt: lastActivityByDeal.get(d.id) ?? d.updated_at,
    }))
    .filter((d) => isStale(d.lastActivityAt))
    .sort((a, b) => {
      const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
      const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
      return aTime - bTime;
    });
}
