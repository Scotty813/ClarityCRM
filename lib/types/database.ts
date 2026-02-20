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

// Deals
export type Deal = Database["public"]["Tables"]["deals"]["Row"];
export type DealActivity = Database["public"]["Tables"]["deal_activities"]["Row"];
export type DealTask = Database["public"]["Tables"]["deal_tasks"]["Row"];
export type DealStage = Database["public"]["Enums"]["deal_stage"];
export type DealActivityType = Database["public"]["Enums"]["deal_activity_type"];

export interface DealWithRelations extends Deal {
  contact_name: string | null;
  company_name: string | null;
  owner_name: string | null;
  owner_avatar_url: string | null;
  last_activity_at: string | null;
  next_task_title: string | null;
  next_task_due_date: string | null;
}

export interface DealFormData {
  name: string;
  value: string;
  stage: DealStage;
  expected_close_date: string;
  owner_id: string;
  contact_id: string;
  company_id: string;
  notes: string;
  lost_reason: string;
}

export interface DealActivityWithAuthor extends DealActivity {
  author_name: string | null;
}

export interface DealTaskFormData {
  title: string;
  due_date: string;
}
