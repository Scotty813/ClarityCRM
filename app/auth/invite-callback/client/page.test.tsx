import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import InviteCallbackClientPage from "./page";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  setSession: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      setSession: mocks.setSession,
      getUser: mocks.getUser,
    },
  }),
}));

describe("InviteCallbackClientPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/auth/invite-callback/client");

    mocks.setSession.mockResolvedValue({ error: null });
    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          user_metadata: {
            invited_to_org: "org_123",
          },
        },
      },
      error: null,
    });
  });

  it("sets invite session and redirects to set password", async () => {
    window.history.replaceState(
      null,
      "",
      "/auth/invite-callback/client#access_token=access&refresh_token=refresh",
    );

    render(<InviteCallbackClientPage />);

    await vi.waitFor(() => {
      expect(mocks.setSession).toHaveBeenCalledWith({
        access_token: "access",
        refresh_token: "refresh",
      });
      expect(mocks.replace).toHaveBeenCalledWith("/auth/set-password");
    });

    expect(window.location.hash).toBe("");
  });

  it("shows auth error when session setup fails", async () => {
    window.history.replaceState(
      null,
      "",
      "/auth/invite-callback/client#access_token=access&refresh_token=refresh",
    );
    mocks.setSession.mockResolvedValueOnce({
      error: { message: "Session setup failed." },
    });

    render(<InviteCallbackClientPage />);

    expect(await screen.findByText("Authentication Error")).toBeInTheDocument();
    expect(await screen.findByText("Session setup failed.")).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("redirects when tokens are missing but invited user is already authenticated", async () => {
    render(<InviteCallbackClientPage />);

    await vi.waitFor(() => {
      expect(mocks.setSession).not.toHaveBeenCalled();
      expect(mocks.getUser).toHaveBeenCalled();
      expect(mocks.replace).toHaveBeenCalledWith("/auth/set-password");
    });
  });

  it("runs callback completion once in strict mode", async () => {
    window.history.replaceState(
      null,
      "",
      "/auth/invite-callback/client#access_token=access&refresh_token=refresh",
    );

    render(
      <StrictMode>
        <InviteCallbackClientPage />
      </StrictMode>,
    );

    await vi.waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/auth/set-password");
    });

    expect(mocks.setSession).toHaveBeenCalledTimes(1);
  });
});
