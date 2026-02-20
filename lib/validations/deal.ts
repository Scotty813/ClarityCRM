import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";

// Thin wrapper to handle zod v4.3 type compatibility with @hookform/resolvers
// Runtime behavior is correct; this resolves a TS type mismatch
export function zodResolverCompat<T extends FieldValues>(
  schema: z.ZodType<T>
): Resolver<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return zodResolver(schema as any) as unknown as Resolver<T>;
}

export const dealFormSchema = z.object({
  name: z.string().min(1, "Deal name is required").max(200),
  value: z.string(),
  stage: z.enum(["qualified", "proposal", "negotiation", "won", "lost"]),
  expected_close_date: z.string(),
  owner_id: z.string(),
  contact_id: z.string().min(1, "Contact is required"),
  company_id: z.string().min(1, "Company is required"),
  notes: z.string(),
  lost_reason: z.string(),
});

export type DealFormValues = z.infer<typeof dealFormSchema>;

export const closeDealWonSchema = z.object({
  close_date: z.string().min(1, "Close date is required"),
});

export type CloseDealWonValues = z.infer<typeof closeDealWonSchema>;

export const closeDealLostSchema = z.object({
  lost_reason: z.string().min(1, "Please provide a reason"),
});

export type CloseDealLostValues = z.infer<typeof closeDealLostSchema>;

export const dealTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200),
  due_date: z.string().min(1, "Due date is required").refine(
    (val) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(val + "T00:00:00") >= today;
    },
    { message: "Due date cannot be in the past" }
  ),
});

export type DealTaskFormValues = z.infer<typeof dealTaskSchema>;
