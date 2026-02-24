"use server";

import { revalidatePath } from "next/cache";
import { adminSupabase } from "@/lib/supabase/admin";
import { tryAuthorize } from "@/lib/supabase/authorize";
import { can } from "@/lib/permissions";
import { editMemberSchema } from "@/lib/validations/member";

export async function updateMember(data: {
  organization_user_id: string;
  first_name: string;
  last_name: string;
  role: string;
}) {
  const parsed = editMemberSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const result = await tryAuthorize("member:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId, role: callerRole } = result.context;

  // Fetch target membership scoped to caller's org
  const { data: target, error: targetError } = await adminSupabase
    .from("organization_users")
    .select("id, user_id, role")
    .eq("id", parsed.data.organization_user_id)
    .eq("organization_id", orgId)
    .single();

  if (targetError || !target) {
    return { success: false, error: "Member not found in this organization" };
  }

  // Admins cannot edit an owner's details
  if (target.role === "owner" && callerRole !== "owner") {
    return { success: false, error: "Only owners can edit another owner's details" };
  }

  const roleChanged = parsed.data.role !== target.role;

  if (roleChanged) {
    // Role changes require owner-level permission
    if (!can(callerRole, "member:edit-role")) {
      return { success: false, error: "Only owners can change member roles" };
    }

    // Non-owners cannot assign owner role
    if (parsed.data.role === "owner" && callerRole !== "owner") {
      return { success: false, error: "Only owners can assign the owner role" };
    }

    // Prevent demoting the last owner
    if (target.role === "owner" && parsed.data.role !== "owner") {
      const { count } = await adminSupabase
        .from("organization_users")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("role", "owner");

      if ((count ?? 0) <= 1) {
        return {
          success: false,
          error: "Cannot change role — this is the only owner in the organization",
        };
      }
    }

    // Update role
    const { error: roleError } = await adminSupabase
      .from("organization_users")
      .update({ role: parsed.data.role })
      .eq("id", target.id);

    if (roleError) {
      return { success: false, error: roleError.message };
    }
  }

  // Update profile (first_name, last_name) via admin client to bypass RLS
  const { error: profileError } = await adminSupabase
    .from("profiles")
    .update({
      first_name: parsed.data.first_name.trim(),
      last_name: parsed.data.last_name.trim() || null,
    })
    .eq("id", target.user_id);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  revalidatePath("/settings/team");
  return { success: true };
}
