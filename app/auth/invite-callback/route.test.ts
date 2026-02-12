import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  signOut: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
}));

import { GET } from "./route";

describe("GET /auth/invite-callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.signOut.mockResolvedValue({ error: null });
    mocks.verifyOtp.mockResolvedValue({ error: null });
    mocks.createServerClient.mockReturnValue({
      auth: {
        signOut: mocks.signOut,
        verifyOtp: mocks.verifyOtp,
      },
    });
  });

  it("rejects non-invite token types", async () => {
    const request = new NextRequest(
      "http://localhost/auth/invite-callback?token_hash=abc&type=magiclink",
    );

    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "http://localhost/auth/invite-callback/client",
    );
    expect(mocks.createServerClient).not.toHaveBeenCalled();
  });

  it("redirects to set-password after successful invite verification", async () => {
    const request = new NextRequest(
      "http://localhost/auth/invite-callback?token_hash=abc&type=invite",
    );

    const response = await GET(request);

    expect(mocks.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(mocks.verifyOtp).toHaveBeenCalledWith({
      token_hash: "abc",
      type: "invite",
    });
    expect(response.headers.get("location")).toBe("http://localhost/auth/set-password");
  });

  it("redirects to auth error if sign out fails", async () => {
    mocks.signOut.mockResolvedValueOnce({ error: { message: "failed" } });
    const request = new NextRequest(
      "http://localhost/auth/invite-callback?token_hash=abc&type=invite",
    );

    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "http://localhost/auth/auth-code-error",
    );
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
  });

  it("redirects to client fallback when token_hash is missing", async () => {
    const request = new NextRequest("http://localhost/auth/invite-callback");
    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "http://localhost/auth/invite-callback/client",
    );
  });
});
