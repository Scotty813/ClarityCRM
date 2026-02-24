import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileForm } from "./profile-form";

const mocks = vi.hoisted(() => ({
  updateProfile: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/actions/profiles", () => ({
  updateProfile: mocks.updateProfile,
}));

vi.mock("sonner", () => ({
  toast: mocks.toast,
}));

const defaultProps = {
  firstName: "Jane",
  lastName: "Smith",
  email: "jane@example.com",
  avatarUrl: null,
  createdAt: "2025-01-15T00:00:00.000Z",
};

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with pre-populated names", () => {
    render(<ProfileForm {...defaultProps} />);

    expect(screen.getByLabelText(/first name/i)).toHaveValue("Jane");
    expect(screen.getByLabelText(/last name/i)).toHaveValue("Smith");
  });

  it("renders read-only email and member since", () => {
    render(<ProfileForm {...defaultProps} />);

    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("January 2025")).toBeInTheDocument();
  });

  it("renders avatar with initials", () => {
    render(<ProfileForm {...defaultProps} />);

    expect(screen.getByText("JS")).toBeInTheDocument();
  });

  it("disables save button when form is clean", () => {
    render(<ProfileForm {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });

  it("enables save button when form is dirty", async () => {
    const user = userEvent.setup();
    render(<ProfileForm {...defaultProps} />);

    await user.clear(screen.getByLabelText(/first name/i));
    await user.type(screen.getByLabelText(/first name/i), "Janet");

    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  });

  it("validates required first name", async () => {
    const user = userEvent.setup();
    render(<ProfileForm {...defaultProps} />);

    await user.clear(screen.getByLabelText(/first name/i));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("First name is required")).toBeInTheDocument();
    expect(mocks.updateProfile).not.toHaveBeenCalled();
  });

  it("calls updateProfile with correct data on submit", async () => {
    mocks.updateProfile.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<ProfileForm {...defaultProps} />);

    await user.clear(screen.getByLabelText(/first name/i));
    await user.type(screen.getByLabelText(/first name/i), "Janet");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(mocks.updateProfile).toHaveBeenCalledWith({
      first_name: "Janet",
      last_name: "Smith",
    });
  });

  it("shows success toast on successful save", async () => {
    mocks.updateProfile.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<ProfileForm {...defaultProps} />);

    await user.clear(screen.getByLabelText(/first name/i));
    await user.type(screen.getByLabelText(/first name/i), "Janet");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await vi.waitFor(() => {
      expect(mocks.toast.success).toHaveBeenCalledWith("Profile updated");
    });
  });

  it("shows error toast on failed save", async () => {
    mocks.updateProfile.mockResolvedValue({
      success: false,
      error: "Something went wrong",
    });
    const user = userEvent.setup();
    render(<ProfileForm {...defaultProps} />);

    await user.clear(screen.getByLabelText(/first name/i));
    await user.type(screen.getByLabelText(/first name/i), "Janet");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await vi.waitFor(() => {
      expect(mocks.toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });
});
