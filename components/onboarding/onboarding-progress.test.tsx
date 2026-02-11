import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OnboardingProgress } from "./onboarding-progress";

describe("OnboardingProgress", () => {
  it("renders all step labels", () => {
    render(<OnboardingProgress currentStep={1} />);
    expect(screen.getByText("Your goal")).toBeInTheDocument();
    expect(screen.getByText("Workspace")).toBeInTheDocument();
    expect(screen.getByText("Setup")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("shows current step number as active", () => {
    render(<OnboardingProgress currentStep={2} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows checkmark for completed steps", () => {
    const { container } = render(<OnboardingProgress currentStep={3} />);
    // Steps 1 and 2 should have checkmark SVGs
    const checkmarks = container.querySelectorAll("svg");
    expect(checkmarks.length).toBe(2);
  });
});
