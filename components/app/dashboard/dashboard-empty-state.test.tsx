import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardEmptyState } from "./dashboard-empty-state";

describe("DashboardEmptyState", () => {
  it("renders the 'No deals yet' heading", () => {
    render(<DashboardEmptyState />);

    expect(screen.getByText("No deals yet")).toBeInTheDocument();
  });

  it("renders the description text about creating a first deal", () => {
    render(<DashboardEmptyState />);

    expect(
      screen.getByText(/create your first deal to see pipeline metrics/i)
    ).toBeInTheDocument();
  });

  it("renders a link to /deals", () => {
    render(<DashboardEmptyState />);

    const link = screen.getByRole("link", { name: /go to deals/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/deals");
  });

  it("renders the 'Go to Deals' button text", () => {
    render(<DashboardEmptyState />);

    expect(screen.getByText("Go to Deals")).toBeInTheDocument();
  });
});
