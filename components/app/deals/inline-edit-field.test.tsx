import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DollarSign, Calendar } from "lucide-react";
import {
  InlineEditField,
  type InlineEditFieldProps,
} from "./inline-edit-field";

const currencyProps: InlineEditFieldProps = {
  icon: DollarSign,
  label: "Value",
  value: 50000,
  placeholder: "Add deal value",
  type: "currency",
  onSave: vi.fn(),
};

const dateProps: InlineEditFieldProps = {
  icon: Calendar,
  label: "Expected Close",
  value: "2025-06-15",
  placeholder: "Add close date",
  type: "date",
  onSave: vi.fn(),
};

function renderField(overrides: Partial<InlineEditFieldProps> = {}) {
  const props = { ...currencyProps, ...overrides, onSave: overrides.onSave ?? vi.fn() };
  return { ...render(<InlineEditField {...props} />), onSave: props.onSave };
}

describe("InlineEditField", () => {
  it("renders formatted currency value in idle mode", () => {
    renderField();
    expect(screen.getByRole("button", { name: "$50,000" })).toBeInTheDocument();
  });

  it("renders formatted date value in idle mode", () => {
    renderField({ ...dateProps });
    expect(
      screen.getByRole("button", { name: "June 15, 2025" })
    ).toBeInTheDocument();
  });

  it("renders placeholder when value is null", () => {
    renderField({ value: null });
    expect(
      screen.getByRole("button", { name: "Add deal value" })
    ).toBeInTheDocument();
  });

  it("renders the label text", () => {
    renderField();
    expect(screen.getByText("Value")).toBeInTheDocument();
  });

  it("enters edit mode on click and shows an input", async () => {
    renderField();
    await userEvent.click(screen.getByRole("button", { name: "$50,000" }));
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("pre-fills input with raw value on edit", async () => {
    renderField();
    await userEvent.click(screen.getByRole("button", { name: "$50,000" }));
    expect(screen.getByRole("spinbutton")).toHaveValue(50000);
  });

  it("saves on Enter key and exits edit mode", async () => {
    const onSave = vi.fn();
    renderField({ value: null, onSave });

    // Click placeholder to enter edit mode
    await userEvent.click(
      screen.getByRole("button", { name: "Add deal value" })
    );
    const input = screen.getByRole("spinbutton");
    await userEvent.type(input, "75000");
    await userEvent.keyboard("{Enter}");

    expect(onSave).toHaveBeenCalledWith("75000");
    // Should be back to idle (button visible)
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("saves on blur", async () => {
    const onSave = vi.fn();
    renderField({ value: null, onSave });

    await userEvent.click(
      screen.getByRole("button", { name: "Add deal value" })
    );
    const input = screen.getByRole("spinbutton");
    await userEvent.type(input, "12000");
    await userEvent.tab(); // triggers blur

    expect(onSave).toHaveBeenCalledWith("12000");
  });

  it("cancels on Escape without saving", async () => {
    const onSave = vi.fn();
    renderField({ onSave });

    await userEvent.click(screen.getByRole("button", { name: "$50,000" }));
    const input = screen.getByRole("spinbutton");
    await userEvent.clear(input);
    await userEvent.type(input, "99999");
    await userEvent.keyboard("{Escape}");

    expect(onSave).not.toHaveBeenCalled();
    // Should show original formatted value
    expect(screen.getByRole("button", { name: "$50,000" })).toBeInTheDocument();
  });

  it("calls onSave(null) when clearing a non-null value", async () => {
    const onSave = vi.fn();
    renderField({ onSave });

    await userEvent.click(screen.getByRole("button", { name: "$50,000" }));
    const input = screen.getByRole("spinbutton");
    await userEvent.clear(input);
    await userEvent.keyboard("{Enter}");

    expect(onSave).toHaveBeenCalledWith(null);
  });

  it("does not call onSave when value is unchanged", async () => {
    const onSave = vi.fn();
    renderField({ onSave });

    await userEvent.click(screen.getByRole("button", { name: "$50,000" }));
    // Don't change anything, just press Enter
    await userEvent.keyboard("{Enter}");

    expect(onSave).not.toHaveBeenCalled();
  });

  it("renders date input in edit mode for date type", async () => {
    renderField({ ...dateProps });
    await userEvent.click(
      screen.getByRole("button", { name: "June 15, 2025" })
    );
    const input = screen.getByDisplayValue("2025-06-15");
    expect(input).toHaveAttribute("type", "date");
  });
});
