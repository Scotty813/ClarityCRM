import { afterEach, describe, expect, it, vi } from "vitest"
import { cn, resolveOrigin } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
  })

  it("deduplicates conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })
})

function fakeHeaders(map: Record<string, string>) {
  return { get: (name: string) => map[name] ?? null }
}

describe("resolveOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns origin from x-forwarded-host and x-forwarded-proto", () => {
    const headers = fakeHeaders({
      "x-forwarded-host": "myapp.com",
      "x-forwarded-proto": "https",
    })
    expect(resolveOrigin(headers)).toBe("https://myapp.com")
  })

  it("prefers x-forwarded-host over host header", () => {
    const headers = fakeHeaders({
      "x-forwarded-host": "public.com",
      host: "internal:3000",
      "x-forwarded-proto": "https",
    })
    expect(resolveOrigin(headers)).toBe("https://public.com")
  })

  it("falls back to host header when x-forwarded-host is absent", () => {
    const headers = fakeHeaders({ host: "example.com" })
    expect(resolveOrigin(headers)).toBe("https://example.com")
  })

  it("uses http for localhost", () => {
    const headers = fakeHeaders({ host: "localhost:3000" })
    expect(resolveOrigin(headers)).toBe("http://localhost:3000")
  })

  it("uses http for 127.0.0.1", () => {
    const headers = fakeHeaders({ host: "127.0.0.1:3000" })
    expect(resolveOrigin(headers)).toBe("http://127.0.0.1:3000")
  })

  it("falls back to NEXT_PUBLIC_SITE_URL when no host headers", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://from-env.com")
    const headers = fakeHeaders({})
    expect(resolveOrigin(headers)).toBe("https://from-env.com")
  })

  it("returns null when no headers and no env var", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    const headers = fakeHeaders({})
    expect(resolveOrigin(headers)).toBeNull()
  })
})
