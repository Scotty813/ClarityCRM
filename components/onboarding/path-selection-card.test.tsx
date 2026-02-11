import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Target } from "lucide-react";
import { PathSelectionCard } from "./path-selection-card";

describe("PathSelectionCard", () => {
  it("renders label and description", () => {
    render(
      <PathSelectionCard
        icon={Target}
        label="Track leads"
        description="Capture and nurture potential customers."
        selected={false}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText("Track leads")).toBeInTheDocument();
    expect(
      screen.getByText("Capture and nurture potential customers."),
    ).toBeInTheDocument();
  });

  it("calls onSelect when clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <PathSelectionCard
        icon={Target}
        label="Track leads"
        description="Test"
        selected={false}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("applies selected styles when selected", () => {
    render(
      <PathSelectionCard
        icon={Target}
        label="Track leads"
        description="Test"
        selected={true}
        onSelect={() => {}}
      />,
    );

    const button = screen.getByRole("button");
    expect(button.className).toContain("ring-2");
  });
});
