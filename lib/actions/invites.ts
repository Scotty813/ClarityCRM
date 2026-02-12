"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { getActiveOrganization } from "@/lib/supabase/active-org";
import type { MemberRole } from "@/lib/types/database";

const MEMBER_ROLES: MemberRole[] = ["owner", "admin", "member"];

function isMemberRole(value: unknown): value is MemberRole {
  return typeof value === "string" && MEMBER_ROLES.includes(value as MemberRole);
}

async function getAppOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) {
    return null;
  }

  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const protocol =
    forwardedProto ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function inviteUser(email: string, role: MemberRole) {
  const supabase = await createClient();
  const { orgId, userId } = await getActiveOrganization();

  // Check caller's role — must be owner or admin
  const { data: callerMembership } = await supabase
    .from("organization_users")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .single();

  if (!callerMembership || callerMembership.role === "member") {
    return { success: false, error: "You don't have permission to invite users" };
  }

  // Only owners can assign the owner role
  if (role === "owner" && callerMembership.role !== "owner") {
    return { success: false, error: "Only owners can assign the owner role" };
  }

  // Check if user already exists
  const { data: existingProfile } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) {
    // Check if already in this org
    const { data: existingMembership } = await supabase
      .from("organization_users")
      .select("id")
      .eq("organization_id", orgId)
      .eq("user_id", existingProfile.id)
      .maybeSingle();

    if (existingMembership) {
      return { success: false, error: "This user is already a member of the organization" };
    }

    // Existing user not in org — add directly
    const { error: insertError } = await adminSupabase
      .from("organization_users")
      .insert({
        organization_id: orgId,
        user_id: existingProfile.id,
        role,
      });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath("/users");
    return { success: true };
  }

  // New user — send invite email with metadata
  const appOrigin = await getAppOrigin();
  const { error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: appOrigin ? `${appOrigin}/auth/invite-callback` : undefined,
      data: {
        invited_to_org: orgId,
        invited_role: role,
      },
    }
  );

  if (inviteError) {
    return { success: false, error: inviteError.message };
  }

  revalidatePath("/users");
  return { success: true };
}

export async function finalizeInviteAcceptance() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "You must be signed in to accept an invite." };
  }

  const invitedOrg = user.user_metadata?.invited_to_org;
  const invitedRole = user.user_metadata?.invited_role;

  if (typeof invitedOrg !== "string" || invitedOrg.length === 0) {
    return { success: false, error: "Invite organization metadata is missing." };
  }

  if (!isMemberRole(invitedRole)) {
    return { success: false, error: "Invite role metadata is invalid." };
  }

  const { data: membership, error: membershipLookupError } = await adminSupabase
    .from("organization_users")
    .select("id")
    .eq("organization_id", invitedOrg)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipLookupError) {
    return { success: false, error: membershipLookupError.message };
  }

  if (!membership) {
    const { error: membershipInsertError } = await adminSupabase
      .from("organization_users")
      .insert({
        organization_id: invitedOrg,
        user_id: user.id,
        role: invitedRole,
      });

    if (membershipInsertError && membershipInsertError.code !== "23505") {
      return { success: false, error: membershipInsertError.message };
    }
  }

  const { data: profile, error: profileLookupError } = await adminSupabase
    .from("profiles")
    .select("active_org_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileLookupError) {
    return { success: false, error: profileLookupError.message };
  }

  if (profile && !profile.active_org_id) {
    const { error: profileUpdateError } = await adminSupabase
      .from("profiles")
      .update({ active_org_id: invitedOrg })
      .eq("id", user.id);

    if (profileUpdateError) {
      return { success: false, error: profileUpdateError.message };
    }
  }

  return { success: true };
}
