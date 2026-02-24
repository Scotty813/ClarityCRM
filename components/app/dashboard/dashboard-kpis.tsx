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
  },
  {
    key: "openDeals" as const,
    label: "Open Deals",
    icon: TrendingUp,
    format: (v: number) => v.toString(),
    subtext: "In progress",
  },
  {
    key: "wonThisMonth" as const,
    label: "Won This Month",
    icon: Trophy,
    format: (v: number) => formatCurrency(v),
    subtext: "Revenue closed",
  },
  {
    key: "closingSoon" as const,
    label: "Closing Soon",
    icon: Clock,
    format: (v: number) => v.toString(),
    subtext: "Within 14 days",
  },
];

export function DashboardKPIs({ kpis }: { kpis: DashboardKPIs }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {kpiConfig.map(({ key, label, icon: Icon, format, subtext }) => (
        <Card key={key} className="gap-3 py-5">
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="size-4" />
              <span className="text-sm font-medium">{label}</span>
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
