import { z } from "zod";

export const inviteUserSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["owner", "admin", "member"]),
});

export type InviteUserFormValues = z.infer<typeof inviteUserSchema>;
