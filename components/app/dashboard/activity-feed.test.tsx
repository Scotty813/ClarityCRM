import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityFeed } from "./activity-feed";
import type { DashboardActivity } from "@/lib/dashboard";

// Mock formatRelativeTime to return a predictable string
vi.mock("@/lib/format", () => ({
  formatRelativeTime: (date: string | null) =>
    date ? "2d ago" : "Never",
}));

function makeActivity(
  overrides: Partial<DashboardActivity> = {}
): DashboardActivity {
  return {
    id: "act-1",
    activity_type: "note",
    content: "Discussed pricing options",
    metadata: null,
    created_at: "2026-02-20T10:00:00Z",
    author_name: "Alice Johnson",
    deal_id: "deal-1",
    deal_name: "Acme Corp Deal",
    ...overrides,
  };
}

describe("ActivityFeed", () => {
  it("renders empty state when no activities are provided", () => {
    render(<ActivityFeed activities={[]} />);

    expect(
      screen.getByText(/no activity yet/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
  });

  it("renders the card title", () => {
    render(<ActivityFeed activities={[makeActivity()]} />);

    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
  });

  it("renders activity type label", () => {
    render(<ActivityFeed activities={[makeActivity({ activity_type: "note" })]} />);

    expect(screen.getByText("Note")).toBeInTheDocument();
  });

  it("renders deal name for an activity", () => {
    render(
      <ActivityFeed activities={[makeActivity({ deal_name: "Acme Corp Deal" })]} />
    );

    expect(screen.getByText("Acme Corp Deal")).toBeInTheDocument();
  });

  it("renders activity content", () => {
    render(
      <ActivityFeed
        activities={[makeActivity({ content: "Discussed pricing options" })]}
      />
    );

    expect(screen.getByText("Discussed pricing options")).toBeInTheDocument();
  });

  it("renders author name", () => {
    render(
      <ActivityFeed
        activities={[makeActivity({ author_name: "Alice Johnson" })]}
      />
    );

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
  });

  it("renders the relative time from formatRelativeTime", () => {
    render(<ActivityFeed activities={[makeActivity()]} />);

    expect(screen.getByText("2d ago")).toBeInTheDocument();
  });

  it("links each activity to the deal page", () => {
    render(
      <ActivityFeed activities={[makeActivity({ deal_id: "deal-42" })]} />
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/deals/deal-42");
  });

  it("renders multiple activities", () => {
    const activities = [
      makeActivity({ id: "act-1", content: "First note" }),
      makeActivity({
        id: "act-2",
        activity_type: "call",
        content: "Follow-up call",
        deal_name: "Beta Inc",
      }),
      makeActivity({
        id: "act-3",
        activity_type: "email",
        content: "Sent proposal",
        deal_name: "Gamma LLC",
      }),
    ];

    render(<ActivityFeed activities={activities} />);

    expect(screen.getByText("First note")).toBeInTheDocument();
    expect(screen.getByText("Follow-up call")).toBeInTheDocument();
    expect(screen.getByText("Sent proposal")).toBeInTheDocument();
    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByText("Call")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders at most 8 activities", () => {
    const activities = Array.from({ length: 12 }, (_, i) =>
      makeActivity({ id: `act-${i}`, content: `Activity ${i}` })
    );

    render(<ActivityFeed activities={activities} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(8);
  });

  it("handles activity without content gracefully", () => {
    render(
      <ActivityFeed activities={[makeActivity({ content: null })]} />
    );

    // Should still render the activity type label and deal name
    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp Deal")).toBeInTheDocument();
  });

  it("handles activity without deal_name gracefully", () => {
    render(
      <ActivityFeed activities={[makeActivity({ deal_name: null })]} />
    );

    // Should still render the type label and content
    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByText("Discussed pricing options")).toBeInTheDocument();
  });

  it("handles activity without author_name gracefully", () => {
    render(
      <ActivityFeed activities={[makeActivity({ author_name: null })]} />
    );

    // Should still render everything else
    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByText("Discussed pricing options")).toBeInTheDocument();
  });

  it("renders correct activity type labels for all types", () => {
    const activities = [
      makeActivity({ id: "1", activity_type: "note" }),
      makeActivity({ id: "2", activity_type: "call" }),
      makeActivity({ id: "3", activity_type: "email" }),
      makeActivity({ id: "4", activity_type: "meeting" }),
      makeActivity({ id: "5", activity_type: "stage_change" }),
    ];

    render(<ActivityFeed activities={activities} />);

    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByText("Call")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Meeting")).toBeInTheDocument();
    expect(screen.getByText("Stage Change")).toBeInTheDocument();
  });
});
