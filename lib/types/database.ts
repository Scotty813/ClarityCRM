import type { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type MemberRole = Database["public"]["Enums"]["member_role"];
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];

export interface UserOrganization {
  id: string;
  name: string;
  role: Database["public"]["Tables"]["organization_users"]["Row"]["role"];
}

export interface OrgUser {
  id: string;
  user_id: string;
  role: MemberRole;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
}

export interface ContactWithCompany extends Contact {
  company_name: string | null;
}

export interface CompanyFormData {
  name: string;
  domain: string;
  industry: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  notes: string;
}

export interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  company_id: string;
  notes: string;
}
