import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolve the public-facing origin from request headers.
 * Works with both route-handler `request.headers` and server-action `await headers()`.
 *
 * Priority: x-forwarded-host + x-forwarded-proto → host header → NEXT_PUBLIC_SITE_URL → null
 */
export function resolveOrigin(headers: { get(name: string): string | null }): string | null {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");

  if (host) {
    const proto =
      headers.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? null;
}

export function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
