import { z } from "zod";

export const profileFormSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().max(50).default(""),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
