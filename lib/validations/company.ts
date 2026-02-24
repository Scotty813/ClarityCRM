import { z } from "zod";

export const companyFormSchema = z.object({
  name: z.string().min(1, "Company name is required").max(200),
  domain: z.string(),
  industry: z.string(),
  phone: z.string(),
  address_line1: z.string(),
  address_line2: z.string(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string(),
  notes: z.string(),
  owner_id: z.string(),
  lifecycle_stage: z.enum(["lead", "prospect", "customer", "churned", "partner"]),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
