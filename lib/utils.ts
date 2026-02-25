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
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? null;
  const forwardedHost = headers.get("x-forwarded-host");
  const host = (forwardedHost ?? headers.get("host"))?.split(",")[0]?.trim();

  if (host) {
    const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const isLocalHost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    const proto = forwardedProto ?? (isLocalHost ? "http" : "https");
    const headerOrigin = `${proto}://${host}`;

    if (isLocalHost && envOrigin && !envOrigin.includes("localhost") && !envOrigin.includes("127.0.0.1")) {
      return envOrigin;
    }

    return headerOrigin;
  }

  return envOrigin;
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
