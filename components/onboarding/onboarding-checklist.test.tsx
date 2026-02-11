import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingChecklist } from "./onboarding-checklist";

describe("OnboardingChecklist", () => {
  it("renders all checklist items", () => {
    render(<OnboardingChecklist />);
    expect(screen.getByText("Create account")).toBeInTheDocument();
    expect(screen.getByText("Set up workspace")).toBeInTheDocument();
    expect(screen.getByText("Add first contact")).toBeInTheDocument();
    expect(screen.getByText("Create pipeline")).toBeInTheDocument();
    expect(screen.getByText("Invite teammate")).toBeInTheDocument();
  });

  it("shows completion count", () => {
    render(<OnboardingChecklist />);
    expect(screen.getByText("2 of 5 complete")).toBeInTheDocument();
  });

  it("can be dismissed", async () => {
    const user = userEvent.setup();
    render(<OnboardingChecklist />);

    expect(screen.getByText("Getting started")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dismiss checklist" }));

    expect(screen.queryByText("Getting started")).not.toBeInTheDocument();
  });
});
