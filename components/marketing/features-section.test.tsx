import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeaturesSection } from "./features-section";

describe("FeaturesSection", () => {
  it("renders the section heading", () => {
    render(<FeaturesSection />);
    expect(
      screen.getByText("Everything you need to close more deals")
    ).toBeInTheDocument();
  });

  it("renders all six feature cards", () => {
    render(<FeaturesSection />);
    expect(screen.getByText("Contact Management")).toBeInTheDocument();
    expect(screen.getByText("Pipeline Tracking")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Email Integration")).toBeInTheDocument();
    expect(screen.getByText("Task Automation")).toBeInTheDocument();
    expect(screen.getByText("Team Collaboration")).toBeInTheDocument();
  });
});
