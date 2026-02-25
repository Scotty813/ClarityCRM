import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  exchangeCodeForSession: vi.fn(),
  getUser: vi.fn(),
  profileSingle: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import { GET } from "./route";

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user_123" } } });
    mocks.profileSingle.mockResolvedValue({ data: { onboarding_completed: true } });
    mocks.eq.mockReturnValue({ single: mocks.profileSingle });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.from.mockReturnValue({ select: mocks.select });

    mocks.createClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession: mocks.exchangeCodeForSession,
        getUser: mocks.getUser,
      },
      from: mocks.from,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses NEXT_PUBLIC_SITE_URL for next redirects when host is localhost", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.example.com");
    const request = new NextRequest("http://localhost/auth/callback?code=abc&next=/dashboard");

    const response = await GET(request);

    expect(response.headers.get("location")).toBe("https://staging.example.com/dashboard");
    expect(mocks.getUser).not.toHaveBeenCalled();
  });

  it("uses NEXT_PUBLIC_SITE_URL for onboarding redirects when host is localhost", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.example.com");
    const request = new NextRequest("http://localhost/auth/callback?code=abc");

    const response = await GET(request);

    expect(response.headers.get("location")).toBe("https://app.example.com/dashboard");
    expect(mocks.from).toHaveBeenCalledWith("profiles");
  });
});
