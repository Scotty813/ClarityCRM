import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SetPasswordForm } from "./set-password-form";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  updateUser: vi.fn(),
  finalizeInviteAcceptance: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      updateUser: mocks.updateUser,
    },
  }),
}));

vi.mock("@/lib/actions/invites", () => ({
  finalizeInviteAcceptance: mocks.finalizeInviteAcceptance,
}));

describe("SetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("completes password setup and redirects on success", async () => {
    mocks.updateUser
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null });
    mocks.finalizeInviteAcceptance.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<SetPasswordForm />);

    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm password"), "password123");
    await user.click(screen.getByRole("button", { name: "Set password" }));

    await vi.waitFor(() => {
      expect(mocks.finalizeInviteAcceptance).toHaveBeenCalled();
      expect(mocks.push).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows an error if invite finalization fails", async () => {
    mocks.updateUser.mockResolvedValueOnce({ error: null });
    mocks.finalizeInviteAcceptance.mockResolvedValue({
      success: false,
      error: "Invite organization metadata is missing.",
    });

    const user = userEvent.setup();
    render(<SetPasswordForm />);

    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm password"), "password123");
    await user.click(screen.getByRole("button", { name: "Set password" }));

    expect(
      await screen.findByText("Invite organization metadata is missing."),
    ).toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("shows an error if invite metadata clearing fails", async () => {
    mocks.updateUser
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: "clear failed" } });
    mocks.finalizeInviteAcceptance.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<SetPasswordForm />);

    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm password"), "password123");
    await user.click(screen.getByRole("button", { name: "Set password" }));

    expect(await screen.findByText("clear failed")).toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
