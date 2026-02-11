export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  selected_path: "leads" | "customers" | "pipeline" | "exploring" | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  active_org_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string | null;
  team_size: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
  updated_at: string;
}

export interface UserOrganization {
  id: string;
  name: string;
  role: OrganizationMember["role"];
}
