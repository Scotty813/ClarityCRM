import {
  ArrowRight,
  FileText,
  Mail,
  Phone,
  Users,
  type LucideIcon,
} from "lucide-react";
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

export const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  note: FileText,
  call: Phone,
  email: Mail,
  meeting: Users,
  stage_change: ArrowRight,
};

export const STAGE_BADGE_COLORS: Record<DealStage, string> = {
  qualified: "",
  proposal: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  negotiation: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  won: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  lost: "bg-destructive/10 text-destructive",
};
