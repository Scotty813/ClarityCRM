import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Users } from "lucide-react";
import { EntityPicker, type EntityPickerProps } from "./entity-picker";

const defaultProps: EntityPickerProps = {
  icon: Users,
  label: "Owner",
  value: null,
  placeholder: "Add owner...",
  options: [
    { id: "1", name: "Alice Smith" },
    { id: "2", name: "Bob Jones" },
    { id: "3", name: "Carol White" },
  ],
  loading: false,
  onSelect: vi.fn(),
  onOpen: vi.fn(),
};

function renderPicker(overrides: Partial<EntityPickerProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  return render(<EntityPicker {...props} />);
}

describe("EntityPicker", () => {
  it("renders placeholder when no value is set", () => {
    renderPicker();
    expect(screen.getByRole("button", { name: "Add owner..." })).toBeInTheDocument();
  });

  it("renders the current value when set", () => {
    renderPicker({ value: "Alice Smith" });
    expect(screen.getByRole("button", { name: "Alice Smith" })).toBeInTheDocument();
  });

  it("renders the label text", () => {
    renderPicker();
    expect(screen.getByText("Owner")).toBeInTheDocument();
  });

  it("opens popover on click and fires onOpen", async () => {
    const onOpen = vi.fn();
    renderPicker({ onOpen });

    await userEvent.click(screen.getByRole("button", { name: "Add owner..." }));

    expect(onOpen).toHaveBeenCalledOnce();
    expect(screen.getByPlaceholderText("Search owner...")).toBeInTheDocument();
  });

  it("displays all options when popover is open", async () => {
    renderPicker();

    await userEvent.click(screen.getByRole("button", { name: "Add owner..." }));

    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getByText("Carol White")).toBeInTheDocument();
  });

  it("fires onSelect with the correct option when selected", async () => {
    const onSelect = vi.fn();
    renderPicker({ onSelect });

    await userEvent.click(screen.getByRole("button", { name: "Add owner..." }));
    await userEvent.click(screen.getByText("Bob Jones"));

    expect(onSelect).toHaveBeenCalledWith({ id: "2", name: "Bob Jones" });
  });

  it("shows remove option only when a value is set", async () => {
    // No value — no remove option
    const { unmount } = renderPicker({ value: null });
    await userEvent.click(screen.getByRole("button", { name: "Add owner..." }));
    expect(screen.queryByText("Remove owner")).not.toBeInTheDocument();
    unmount();

    // With value — remove option shown
    renderPicker({ value: "Alice Smith" });
    await userEvent.click(screen.getByRole("button", { name: "Alice Smith" }));
    expect(screen.getByText("Remove owner")).toBeInTheDocument();
  });

  it("fires onSelect(null) when remove is clicked", async () => {
    const onSelect = vi.fn();
    renderPicker({ value: "Alice Smith", onSelect });

    await userEvent.click(screen.getByRole("button", { name: "Alice Smith" }));
    await userEvent.click(screen.getByText("Remove owner"));

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("filters options by search input", async () => {
    renderPicker();

    await userEvent.click(screen.getByRole("button", { name: "Add owner..." }));
    await userEvent.type(screen.getByPlaceholderText("Search owner..."), "bob");

    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
    expect(screen.queryByText("Carol White")).not.toBeInTheDocument();
  });

  it("shows check icon next to the currently selected item", async () => {
    renderPicker({ value: "Alice Smith" });

    await userEvent.click(screen.getByRole("button", { name: "Alice Smith" }));

    // Find all option items, the selected one (Alice) should have 2 svgs (text + check)
    // while others have 0
    const options = screen.getAllByRole("option");
    // Skip the "Remove owner" option, find Alice's option
    const aliceOption = options.find(
      (opt) => opt.textContent?.includes("Alice Smith") && !opt.textContent?.includes("Remove")
    );
    expect(aliceOption).toBeTruthy();
    // Check icon is rendered as an SVG inside the option
    const svgs = aliceOption!.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });
});
