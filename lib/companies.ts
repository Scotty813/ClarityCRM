import type { LifecycleStage } from "@/lib/types/database";

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  "lead",
  "prospect",
  "customer",
  "churned",
  "partner",
];

export const LIFECYCLE_LABELS: Record<LifecycleStage, string> = {
  lead: "Lead",
  prospect: "Prospect",
  customer: "Customer",
  churned: "Churned",
  partner: "Partner",
};

export const LIFECYCLE_BADGE_COLORS: Record<LifecycleStage, string> = {
  lead: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  prospect: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  customer: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  churned: "bg-destructive/10 text-destructive",
  partner: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export const TAG_COLORS = [
  "gray",
  "red",
  "orange",
  "amber",
  "green",
  "emerald",
  "blue",
  "violet",
  "pink",
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

export const TAG_COLOR_CLASSES: Record<TagColor, string> = {
  gray: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  green: "bg-green-500/10 text-green-600 dark:text-green-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
};
