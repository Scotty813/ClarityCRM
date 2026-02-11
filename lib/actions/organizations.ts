"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UserOrganization } from "@/lib/types/database";

export async function createOrganization(formData: {
  name: string;
  teamSize?: string;
  industry?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: formData.name,
      team_size: formData.teamSize || null,
      industry: formData.industry || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (orgError) throw new Error(orgError.message);

  // Add creator as owner
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) throw new Error(memberError.message);

  // Set as active org and advance onboarding step
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ onboarding_step: 3, active_org_id: org.id })
    .eq("id", user.id);

  if (profileError) throw new Error(profileError.message);

  return org;
}

export async function createAdditionalOrganization(formData: {
  name: string;
  teamSize?: string;
  industry?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: formData.name,
      team_size: formData.teamSize || null,
      industry: formData.industry || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (orgError) throw new Error(orgError.message);

  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) throw new Error(memberError.message);

  // Set the new org as active (no onboarding step change)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ active_org_id: org.id })
    .eq("id", user.id);

  if (profileError) throw new Error(profileError.message);

  revalidatePath("/", "layout");
  return org;
}

export async function switchOrganization(organizationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Verify user is a member of this org
  const { data: membership, error: memberError } = await supabase
    .from("organization_members")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .single();

  if (memberError || !membership) {
    throw new Error("You are not a member of this organization");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ active_org_id: organizationId })
    .eq("id", user.id);

  if (profileError) throw new Error(profileError.message);

  revalidatePath("/", "layout");
}

export async function getUserOrganizations(): Promise<UserOrganization[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("organization_members")
    .select("role, organization:organizations(id, name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return data.map((m) => {
    const org = m.organization as unknown as { id: string; name: string };
    return { id: org.id, name: org.name, role: m.role };
  });
}
