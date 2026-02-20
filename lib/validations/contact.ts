import { z } from "zod";

export const contactFormSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").or(z.literal("")),
  phone: z.string(),
  job_title: z.string(),
  company_id: z.string().min(1, "Company is required"),
  notes: z.string(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
