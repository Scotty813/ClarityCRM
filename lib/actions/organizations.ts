"use server";

import { createClient } from "@/lib/supabase/server";

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

  // Advance onboarding step
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ onboarding_step: 3 })
    .eq("id", user.id);

  if (profileError) throw new Error(profileError.message);

  return org;
}
