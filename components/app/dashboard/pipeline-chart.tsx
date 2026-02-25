"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { PipelineStageData } from "@/lib/dashboard";

const chartConfig = {
  value: { label: "Value" },
  qualified: { label: "Qualified", color: "var(--chart-1)" },
  proposal: { label: "Proposal", color: "var(--chart-2)" },
  negotiation: { label: "Negotiation", color: "var(--chart-3)" },
} satisfies ChartConfig;

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PipelineStageData }[];
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="font-medium">{data.stage}</p>
      <p className="mt-1 text-muted-foreground">
        {data.count} deal{data.count !== 1 ? "s" : ""} &middot;{" "}
        {formatCurrency(data.value)}
      </p>
    </div>
  );
}

export function PipelineChart({
  data,
}: {
  data: PipelineStageData[];
}) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No active pipeline data to display.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Pipeline Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
          <BarChart data={data} layout="vertical" barCategoryGap="20%">
            <XAxis type="number" hide />
            <YAxis
              dataKey="stage"
              type="category"
              width={90}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<CustomTooltip />}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
