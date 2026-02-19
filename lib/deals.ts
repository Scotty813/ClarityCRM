import type { DealStage, DealActivityType } from "@/lib/types/database";

export const DEAL_STAGES: DealStage[] = [
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

export const STAGE_LABELS: Record<DealStage, string> = {
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const ACTIVITY_TYPE_LABELS: Record<DealActivityType, string> = {
  note: "Note",
  stage_change: "Stage Change",
  call: "Call",
  email: "Email",
  meeting: "Meeting",
};
