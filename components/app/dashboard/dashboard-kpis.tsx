import {
  DollarSign,
  TrendingUp,
  Trophy,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { DashboardKPIs } from "@/lib/dashboard";

const kpiConfig = [
  {
    key: "pipelineValue" as const,
    label: "Pipeline Value",
    icon: DollarSign,
    format: (v: number) => formatCurrency(v),
    subtext: "Active deals",
    accent: {
      border: "border-l-kpi-pipeline",
      bg: "bg-kpi-pipeline/10",
      text: "text-kpi-pipeline",
    },
  },
  {
    key: "openDeals" as const,
    label: "Open Deals",
    icon: TrendingUp,
    format: (v: number) => v.toString(),
    subtext: "In progress",
    accent: {
      border: "border-l-kpi-deals",
      bg: "bg-kpi-deals/10",
      text: "text-kpi-deals",
    },
  },
  {
    key: "wonThisMonth" as const,
    label: "Won This Month",
    icon: Trophy,
    format: (v: number) => formatCurrency(v),
    subtext: "Revenue closed",
    accent: {
      border: "border-l-kpi-won",
      bg: "bg-kpi-won/10",
      text: "text-kpi-won",
    },
  },
  {
    key: "closingSoon" as const,
    label: "Closing Soon",
    icon: Clock,
    format: (v: number) => v.toString(),
    subtext: "Within 14 days",
    accent: {
      border: "border-l-kpi-closing",
      bg: "bg-kpi-closing/10",
      text: "text-kpi-closing",
    },
  },
];

export function DashboardKPIs({ kpis }: { kpis: DashboardKPIs }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {kpiConfig.map(({ key, label, icon: Icon, format, subtext, accent }) => (
        <Card key={key} className={`gap-3 overflow-hidden border-l-4 ${accent.border} py-5`}>
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className={`flex size-7 items-center justify-center rounded-lg ${accent.bg}`}>
                <Icon className={`size-3.5 ${accent.text}`} />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-semibold tracking-tight">
              {format(kpis[key])}
            </p>
            <p className="text-xs text-muted-foreground">{subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
