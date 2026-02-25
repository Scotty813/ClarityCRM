import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingChecklist, type ChecklistItem } from "./onboarding-checklist";

vi.mock("@/lib/actions/dashboard", () => ({
  dismissGettingStarted: vi.fn(),
}));

const defaultItems: ChecklistItem[] = [
  { id: "account", label: "Create account", done: true },
  { id: "contact", label: "Add first contact", done: false, href: "/contacts" },
  { id: "pipeline", label: "Create pipeline", done: false, href: "/deals" },
  { id: "invite", label: "Invite teammate", done: false, href: "/settings/team" },
];

describe("OnboardingChecklist", () => {
  it("renders all checklist items", () => {
    render(<OnboardingChecklist items={defaultItems} dismissed={false} />);
    expect(screen.getByText("Create account")).toBeInTheDocument();
    expect(screen.getByText("Add first contact")).toBeInTheDocument();
    expect(screen.getByText("Create pipeline")).toBeInTheDocument();
    expect(screen.getByText("Invite teammate")).toBeInTheDocument();
  });

  it("shows completion count", () => {
    render(<OnboardingChecklist items={defaultItems} dismissed={false} />);
    expect(screen.getByText("1 of 4 complete")).toBeInTheDocument();
  });

  it("renders nothing when dismissed", () => {
    render(<OnboardingChecklist items={defaultItems} dismissed={true} />);
    expect(screen.queryByText("Getting started")).not.toBeInTheDocument();
  });

  it("calls dismissGettingStarted on dismiss click", async () => {
    const { dismissGettingStarted } = await import("@/lib/actions/dashboard");
    const user = userEvent.setup();

    render(<OnboardingChecklist items={defaultItems} dismissed={false} />);
    expect(screen.getByText("Getting started")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dismiss checklist" }));

    expect(dismissGettingStarted).toHaveBeenCalled();
  });

  it("renders links for incomplete items with href", () => {
    render(<OnboardingChecklist items={defaultItems} dismissed={false} />);

    const contactLink = screen.getByRole("link", { name: "Add first contact" });
    expect(contactLink).toHaveAttribute("href", "/contacts");

    const pipelineLink = screen.getByRole("link", { name: "Create pipeline" });
    expect(pipelineLink).toHaveAttribute("href", "/deals");

    const inviteLink = screen.getByRole("link", { name: "Invite teammate" });
    expect(inviteLink).toHaveAttribute("href", "/settings/team");
  });

  it("does not render links for completed items", () => {
    const items: ChecklistItem[] = [
      { id: "account", label: "Create account", done: true },
      { id: "contact", label: "Add first contact", done: true, href: "/contacts" },
    ];

    render(<OnboardingChecklist items={items} dismissed={false} />);

    expect(screen.queryByRole("link", { name: "Create account" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Add first contact" })).not.toBeInTheDocument();
  });
});
