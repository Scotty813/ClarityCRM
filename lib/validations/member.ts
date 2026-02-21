import { z } from "zod";

export const editMemberSchema = z.object({
  organization_user_id: z.string().uuid(),
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().max(50).default(""),
  role: z.enum(["owner", "admin", "member"]),
});

export type EditMemberFormValues = z.infer<typeof editMemberSchema>;
