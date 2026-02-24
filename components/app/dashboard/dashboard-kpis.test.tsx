import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardKPIs } from "./dashboard-kpis";
import type { DashboardKPIs as DashboardKPIsType } from "@/lib/dashboard";

function makeKpis(overrides: Partial<DashboardKPIsType> = {}): DashboardKPIsType {
  return {
    pipelineValue: 150000,
    openDeals: 12,
    wonThisMonth: 45000,
    closingSoon: 3,
    ...overrides,
  };
}

describe("DashboardKPIs", () => {
  it("renders all four KPI card labels", () => {
    render(<DashboardKPIs kpis={makeKpis()} />);

    expect(screen.getByText("Pipeline Value")).toBeInTheDocument();
    expect(screen.getByText("Open Deals")).toBeInTheDocument();
    expect(screen.getByText("Won This Month")).toBeInTheDocument();
    expect(screen.getByText("Closing Soon")).toBeInTheDocument();
  });

  it("renders pipeline value formatted as currency", () => {
    render(<DashboardKPIs kpis={makeKpis({ pipelineValue: 150000 })} />);

    expect(screen.getByText("$150,000")).toBeInTheDocument();
  });

  it("renders won this month formatted as currency", () => {
    render(<DashboardKPIs kpis={makeKpis({ wonThisMonth: 45000 })} />);

    expect(screen.getByText("$45,000")).toBeInTheDocument();
  });

  it("renders open deals as a plain number", () => {
    render(<DashboardKPIs kpis={makeKpis({ openDeals: 12 })} />);

    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders closing soon as a plain number", () => {
    render(<DashboardKPIs kpis={makeKpis({ closingSoon: 3 })} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders subtext for each KPI card", () => {
    render(<DashboardKPIs kpis={makeKpis()} />);

    expect(screen.getByText("Active deals")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Revenue closed")).toBeInTheDocument();
    expect(screen.getByText("Within 14 days")).toBeInTheDocument();
  });

  it("handles zero values correctly", () => {
    render(
      <DashboardKPIs
        kpis={makeKpis({
          pipelineValue: 0,
          openDeals: 0,
          wonThisMonth: 0,
          closingSoon: 0,
        })}
      />
    );

    // Two "$0" texts — one for pipeline value, one for won this month
    expect(screen.getAllByText("$0")).toHaveLength(2);
    // Two "0" texts — one for open deals, one for closing soon
    expect(screen.getAllByText("0")).toHaveLength(2);
  });

  it("handles large numbers with comma formatting", () => {
    render(
      <DashboardKPIs
        kpis={makeKpis({ pipelineValue: 1234567, wonThisMonth: 9876543 })}
      />
    );

    expect(screen.getByText("$1,234,567")).toBeInTheDocument();
    expect(screen.getByText("$9,876,543")).toBeInTheDocument();
  });
});
