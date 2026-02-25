import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PipelineChart } from "./pipeline-chart";
import { getPipelineChartData } from "@/lib/dashboard";
import type { DealStage } from "@/lib/types/database";

// Mock recharts — SVG rendering does not work in jsdom
vi.mock("recharts", () => ({
  Bar: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  XAxis: () => null,
  YAxis: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock the chart UI components that wrap recharts
vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({
    children,
  }: {
    children: React.ReactNode;
    config: unknown;
    className?: string;
  }) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: () => null,
}));

describe("PipelineChart", () => {
  it("renders the card title", () => {
    const data = [
      { stage: "Qualified", value: 10000, count: 2, fill: "var(--chart-1)" },
    ];
    render(<PipelineChart data={data} />);

    expect(screen.getByText("Pipeline Breakdown")).toBeInTheDocument();
  });

  it("renders empty state when data array is empty", () => {
    render(<PipelineChart data={[]} />);

    expect(screen.getByText("Pipeline Breakdown")).toBeInTheDocument();
    expect(
      screen.getByText("No active pipeline data to display.")
    ).toBeInTheDocument();
  });

  it("renders empty state when all values are 0", () => {
    const data = [
      { stage: "Qualified", value: 0, count: 0, fill: "var(--chart-1)" },
      { stage: "Proposal", value: 0, count: 0, fill: "var(--chart-2)" },
      { stage: "Negotiation", value: 0, count: 0, fill: "var(--chart-3)" },
    ];

    render(<PipelineChart data={data} />);

    expect(
      screen.getByText("No active pipeline data to display.")
    ).toBeInTheDocument();
  });

  it("renders chart container when data has non-zero values", () => {
    const data = [
      { stage: "Qualified", value: 50000, count: 3, fill: "var(--chart-1)" },
    ];

    render(<PipelineChart data={data} />);

    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    expect(
      screen.queryByText("No active pipeline data to display.")
    ).not.toBeInTheDocument();
  });

  it("does not render empty state if at least one stage has a non-zero value", () => {
    const data = [
      { stage: "Qualified", value: 0, count: 0, fill: "var(--chart-1)" },
      { stage: "Proposal", value: 25000, count: 1, fill: "var(--chart-2)" },
      { stage: "Negotiation", value: 0, count: 0, fill: "var(--chart-3)" },
    ];

    render(<PipelineChart data={data} />);

    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    expect(
      screen.queryByText("No active pipeline data to display.")
    ).not.toBeInTheDocument();
  });
});

// --- getPipelineChartData helper ---

describe("getPipelineChartData", () => {
  it("aggregates deals by active stages", () => {
    const deals = [
      { stage: "qualified" as DealStage, value: 10000 },
      { stage: "qualified" as DealStage, value: 5000 },
      { stage: "proposal" as DealStage, value: 20000 },
      { stage: "negotiation" as DealStage, value: 30000 },
    ];

    const result = getPipelineChartData(deals);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      stage: "Qualified",
      value: 15000,
      count: 2,
      fill: "var(--chart-1)",
    });
    expect(result[1]).toEqual({
      stage: "Proposal",
      value: 20000,
      count: 1,
      fill: "var(--chart-2)",
    });
    expect(result[2]).toEqual({
      stage: "Negotiation",
      value: 30000,
      count: 1,
      fill: "var(--chart-3)",
    });
  });

  it("excludes won and lost deals from aggregation", () => {
    const deals = [
      { stage: "qualified" as DealStage, value: 10000 },
      { stage: "won" as DealStage, value: 50000 },
      { stage: "lost" as DealStage, value: 8000 },
    ];

    const result = getPipelineChartData(deals);

    expect(result).toHaveLength(3);
    expect(result[0].value).toBe(10000); // qualified
    expect(result[1].value).toBe(0); // proposal
    expect(result[2].value).toBe(0); // negotiation
  });

  it("treats null deal values as 0", () => {
    const deals = [
      { stage: "qualified" as DealStage, value: null },
      { stage: "qualified" as DealStage, value: 5000 },
    ];

    const result = getPipelineChartData(deals);

    expect(result[0].value).toBe(5000);
    expect(result[0].count).toBe(2);
  });

  it("returns all three active stages even when no deals exist", () => {
    const result = getPipelineChartData([]);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      stage: "Qualified",
      value: 0,
      count: 0,
      fill: "var(--chart-1)",
    });
    expect(result[1]).toEqual({
      stage: "Proposal",
      value: 0,
      count: 0,
      fill: "var(--chart-2)",
    });
    expect(result[2]).toEqual({
      stage: "Negotiation",
      value: 0,
      count: 0,
      fill: "var(--chart-3)",
    });
  });

  it("always returns stages in order: Qualified, Proposal, Negotiation", () => {
    const deals = [
      { stage: "negotiation" as DealStage, value: 30000 },
      { stage: "qualified" as DealStage, value: 10000 },
      { stage: "proposal" as DealStage, value: 20000 },
    ];

    const result = getPipelineChartData(deals);

    expect(result[0].stage).toBe("Qualified");
    expect(result[1].stage).toBe("Proposal");
    expect(result[2].stage).toBe("Negotiation");
  });

  it("uses STAGE_LABELS for display names", () => {
    const deals = [
      { stage: "qualified" as DealStage, value: 1000 },
    ];

    const result = getPipelineChartData(deals);

    // "Qualified" not "qualified"
    expect(result[0].stage).toBe("Qualified");
  });

  it("assigns correct fill colors per stage", () => {
    const result = getPipelineChartData([]);

    expect(result[0].fill).toBe("var(--chart-1)");
    expect(result[1].fill).toBe("var(--chart-2)");
    expect(result[2].fill).toBe("var(--chart-3)");
  });

  it("handles a large number of deals correctly", () => {
    const deals = Array.from({ length: 100 }, (_, i) => ({
      stage: (["qualified", "proposal", "negotiation"][i % 3]) as DealStage,
      value: 1000,
    }));

    const result = getPipelineChartData(deals);

    // 100 deals split across 3 stages: 34 qualified, 33 proposal, 33 negotiation
    expect(result[0].count).toBe(34);
    expect(result[1].count).toBe(33);
    expect(result[2].count).toBe(33);
    expect(result[0].value).toBe(34000);
    expect(result[1].value).toBe(33000);
    expect(result[2].value).toBe(33000);
  });
});
