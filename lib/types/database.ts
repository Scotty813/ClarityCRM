import type { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type MemberRole = Database["public"]["Enums"]["member_role"];

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
