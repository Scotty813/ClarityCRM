import { z } from "zod";

export const signupFormSchema = z.object({
  first_name: z.string().max(50).default(""),
  last_name: z.string().max(50).default(""),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;
