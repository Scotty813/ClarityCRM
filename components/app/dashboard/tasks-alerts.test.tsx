import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TasksAlerts } from "./tasks-alerts";
import { getStaleDealData } from "@/lib/dashboard";
import type { DashboardTask, DashboardDeal } from "@/lib/dashboard";
import type { DealStage } from "@/lib/types/database";

// Mock formatRelativeTime for predictable output
vi.mock("@/lib/format", () => ({
  formatRelativeTime: (date: string | null) =>
    date ? "15d ago" : "Never",
  isStale: (date: string | null, days = 14) => {
    if (!date) return true;
    const diffMs = Date.now() - new Date(date).getTime();
    return diffMs > days * 24 * 60 * 60 * 1000;
  },
}));

function makeTask(overrides: Partial<DashboardTask> = {}): DashboardTask {
  return {
    id: "task-1",
    title: "Follow up with client",
    due_date: "2026-03-01T12:00:00",
    deal_id: "deal-1",
    deal_name: "Acme Corp Deal",
    ...overrides,
  };
}

function makeStaleDeal(
  overrides: Partial<{
    id: string;
    name: string;
    stage: DealStage;
    lastActivityAt: string | null;
  }> = {}
) {
  return {
    id: "deal-1",
    name: "Stale Deal",
    stage: "qualified" as DealStage,
    lastActivityAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("TasksAlerts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-24T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the card title", () => {
    render(<TasksAlerts tasks={[]} staleDealData={[]} />);

    expect(screen.getByText("Tasks & Alerts")).toBeInTheDocument();
  });

  it("renders the two tab triggers", () => {
    render(<TasksAlerts tasks={[]} staleDealData={[]} />);

    expect(screen.getByRole("tab", { name: /upcoming tasks/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /needs attention/i })).toBeInTheDocument();
  });

  // --- Tasks tab ---

  it("shows tasks empty state when no tasks provided", () => {
    render(<TasksAlerts tasks={[]} staleDealData={[]} />);

    expect(screen.getByText("No upcoming tasks.")).toBeInTheDocument();
  });

  it("renders task title and deal name", () => {
    render(
      <TasksAlerts
        tasks={[makeTask({ title: "Send proposal", deal_name: "Beta Inc" })]}
        staleDealData={[]}
      />
    );

    expect(screen.getByText("Send proposal")).toBeInTheDocument();
    expect(screen.getByText("Beta Inc")).toBeInTheDocument();
  });

  it("renders formatted due date for a future task", () => {
    render(
      <TasksAlerts
        tasks={[makeTask({ due_date: "2026-03-15T12:00:00" })]}
        staleDealData={[]}
      />
    );

    expect(screen.getByText("Mar 15")).toBeInTheDocument();
  });

  it("shows 'No date' when task has no due date", () => {
    render(
      <TasksAlerts
        tasks={[makeTask({ due_date: null })]}
        staleDealData={[]}
      />
    );

    expect(screen.getByText("No date")).toBeInTheDocument();
  });

  it("renders overdue task with a destructive badge", () => {
    render(
      <TasksAlerts
        tasks={[makeTask({ due_date: "2026-02-20T12:00:00" })]}
        staleDealData={[]}
      />
    );

    const badge = screen.getByText("Feb 20");
    expect(badge).toBeInTheDocument();
    expect(badge.closest("[data-slot='badge']")).toBeInTheDocument();
  });

  it("renders a non-overdue task date as plain text (not a badge)", () => {
    render(
      <TasksAlerts
        tasks={[makeTask({ due_date: "2026-03-15T12:00:00" })]}
        staleDealData={[]}
      />
    );

    const dateText = screen.getByText("Mar 15");
    expect(dateText.tagName).toBe("SPAN");
  });

  it("shows task count badge when tasks exist", () => {
    const tasks = [
      makeTask({ id: "t1" }),
      makeTask({ id: "t2", title: "Second task" }),
    ];

    render(<TasksAlerts tasks={tasks} staleDealData={[]} />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("links each task to its deal page", () => {
    render(
      <TasksAlerts
        tasks={[makeTask({ deal_id: "deal-42" })]}
        staleDealData={[]}
      />
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/deals/deal-42");
  });

  it("renders multiple tasks", () => {
    const tasks = [
      makeTask({ id: "t1", title: "Task one" }),
      makeTask({ id: "t2", title: "Task two" }),
      makeTask({ id: "t3", title: "Task three" }),
    ];

    render(<TasksAlerts tasks={tasks} staleDealData={[]} />);

    expect(screen.getByText("Task one")).toBeInTheDocument();
    expect(screen.getByText("Task two")).toBeInTheDocument();
    expect(screen.getByText("Task three")).toBeInTheDocument();
  });

  it("shows stale deal count badge when stale deals exist", () => {
    const staleDealData = [
      makeStaleDeal({ id: "d1" }),
      makeStaleDeal({ id: "d2", name: "Another stale deal" }),
    ];

    render(<TasksAlerts tasks={[]} staleDealData={staleDealData} />);

    const badges = screen.getAllByText("2");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});

// --- Stale deals tab (uses real timers for Radix tab switching) ---

describe("TasksAlerts - Needs Attention tab", () => {
  it("shows stale deals empty state when switching to Needs Attention tab", async () => {
    const user = userEvent.setup();

    render(<TasksAlerts tasks={[]} staleDealData={[]} />);

    await user.click(screen.getByRole("tab", { name: /needs attention/i }));

    expect(screen.getByText("All deals are up to date.")).toBeInTheDocument();
  });

  it("renders stale deal name and last activity time", async () => {
    const user = userEvent.setup();

    render(
      <TasksAlerts
        tasks={[]}
        staleDealData={[makeStaleDeal({ name: "Old Deal" })]}
      />
    );

    await user.click(screen.getByRole("tab", { name: /needs attention/i }));

    expect(screen.getByText("Old Deal")).toBeInTheDocument();
    expect(screen.getByText(/last activity 15d ago/i)).toBeInTheDocument();
  });

  it("renders stage badge for stale deals", async () => {
    const user = userEvent.setup();

    render(
      <TasksAlerts
        tasks={[]}
        staleDealData={[makeStaleDeal({ stage: "proposal" })]}
      />
    );

    await user.click(screen.getByRole("tab", { name: /needs attention/i }));

    expect(screen.getByText("Proposal")).toBeInTheDocument();
  });

  it("links stale deals to their deal page", async () => {
    const user = userEvent.setup();

    render(
      <TasksAlerts
        tasks={[]}
        staleDealData={[makeStaleDeal({ id: "deal-99" })]}
      />
    );

    await user.click(screen.getByRole("tab", { name: /needs attention/i }));

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/deals/deal-99");
  });
});

// --- getStaleDealData helper ---

describe("getStaleDealData", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-24T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function makeDashboardDeal(
    overrides: Partial<DashboardDeal> = {}
  ): DashboardDeal {
    return {
      id: "deal-1",
      name: "Test Deal",
      value: 10000,
      stage: "qualified",
      expected_close_date: null,
      updated_at: "2026-01-01T00:00:00Z",
      company_name: null,
      ...overrides,
    };
  }

  it("returns stale active deals sorted by oldest activity first", () => {
    const deals = [
      makeDashboardDeal({
        id: "d1",
        name: "Old Deal",
        stage: "qualified",
        updated_at: "2026-01-01T00:00:00Z",
      }),
      makeDashboardDeal({
        id: "d2",
        name: "Newer Deal",
        stage: "proposal",
        updated_at: "2026-01-15T00:00:00Z",
      }),
    ];

    const activities = [
      { deal_id: "d1", created_at: "2026-01-05T00:00:00Z" },
      { deal_id: "d2", created_at: "2026-01-20T00:00:00Z" },
    ];

    const result = getStaleDealData(deals, activities);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("d1");
    expect(result[1].id).toBe("d2");
  });

  it("excludes won and lost deals", () => {
    const deals = [
      makeDashboardDeal({ id: "d1", stage: "won" }),
      makeDashboardDeal({ id: "d2", stage: "lost" }),
      makeDashboardDeal({ id: "d3", stage: "qualified" }),
    ];

    const result = getStaleDealData(deals, []);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("d3");
  });

  it("includes only active stages: qualified, proposal, negotiation", () => {
    const deals = [
      makeDashboardDeal({ id: "d1", stage: "qualified" }),
      makeDashboardDeal({ id: "d2", stage: "proposal" }),
      makeDashboardDeal({ id: "d3", stage: "negotiation" }),
      makeDashboardDeal({ id: "d4", stage: "won" }),
      makeDashboardDeal({ id: "d5", stage: "lost" }),
    ];

    const result = getStaleDealData(deals, []);

    const ids = result.map((d) => d.id);
    expect(ids).toContain("d1");
    expect(ids).toContain("d2");
    expect(ids).toContain("d3");
    expect(ids).not.toContain("d4");
    expect(ids).not.toContain("d5");
  });

  it("uses the most recent activity timestamp per deal", () => {
    const deals = [
      makeDashboardDeal({
        id: "d1",
        stage: "qualified",
        updated_at: "2025-12-01T00:00:00Z",
      }),
    ];

    const activities = [
      { deal_id: "d1", created_at: "2026-01-01T00:00:00Z" },
      { deal_id: "d1", created_at: "2026-01-10T00:00:00Z" },
      { deal_id: "d1", created_at: "2026-01-05T00:00:00Z" },
    ];

    const result = getStaleDealData(deals, activities);

    expect(result).toHaveLength(1);
    expect(result[0].lastActivityAt).toBe("2026-01-10T00:00:00Z");
  });

  it("falls back to updated_at when no activities exist for a deal", () => {
    const deals = [
      makeDashboardDeal({
        id: "d1",
        stage: "qualified",
        updated_at: "2026-01-01T00:00:00Z",
      }),
    ];

    const result = getStaleDealData(deals, []);

    expect(result).toHaveLength(1);
    expect(result[0].lastActivityAt).toBe("2026-01-01T00:00:00Z");
  });

  it("excludes deals that are not stale (recent activity)", () => {
    const deals = [
      makeDashboardDeal({
        id: "d1",
        stage: "qualified",
        updated_at: "2026-02-24T00:00:00Z",
      }),
    ];

    const activities = [
      { deal_id: "d1", created_at: "2026-02-24T00:00:00Z" },
    ];

    const result = getStaleDealData(deals, activities);

    expect(result).toHaveLength(0);
  });

  it("returns empty array when all deals are won/lost", () => {
    const deals = [
      makeDashboardDeal({ id: "d1", stage: "won" }),
      makeDashboardDeal({ id: "d2", stage: "lost" }),
    ];

    const result = getStaleDealData(deals, []);

    expect(result).toHaveLength(0);
  });

  it("returns empty array when no deals provided", () => {
    const result = getStaleDealData([], []);

    expect(result).toHaveLength(0);
  });
});

// --- isOverdue logic ---

describe("isOverdue (internal logic via rendering)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-24T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("marks a past due date as overdue (renders badge)", () => {
    render(
      <TasksAlerts
        tasks={[makeTask({ due_date: "2026-02-20T12:00:00" })]}
        staleDealData={[]}
      />
    );

    const badge = screen.getByText("Feb 20");
    expect(badge.closest("[data-slot='badge']")).toBeInTheDocument();
  });

  it("does not mark a future due date as overdue", () => {
    render(
      <TasksAlerts
        tasks={[makeTask({ due_date: "2026-03-15T12:00:00" })]}
        staleDealData={[]}
      />
    );

    const dateText = screen.getByText("Mar 15");
    expect(dateText.closest("[data-slot='badge']")).toBeNull();
  });

  it("does not mark null due date as overdue", () => {
    render(
      <TasksAlerts
        tasks={[makeTask({ due_date: null })]}
        staleDealData={[]}
      />
    );

    const noDate = screen.getByText("No date");
    expect(noDate.closest("[data-slot='badge']")).toBeNull();
  });
});
