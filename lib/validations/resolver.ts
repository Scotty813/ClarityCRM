import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { FieldValues, Resolver } from "react-hook-form";

// Thin wrapper to handle zod v4.3 type compatibility with @hookform/resolvers
// Runtime behavior is correct; this resolves a TS type mismatch
export function zodResolverCompat<T extends FieldValues>(
  schema: z.ZodType<T>
): Resolver<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return zodResolver(schema as any) as unknown as Resolver<T>;
}
