import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/lib/supabase/active-org";
import { can, type Permission } from "@/lib/permissions";
import type { MemberRole } from "@/lib/types/database";

export interface AuthContext {
  orgId: string;
  userId: string;
  role: MemberRole;
}

/**
 * Server-side authorization guard.
 * Resolves the caller's org + role, then checks `can(role, permission)`.
 * Throws on failure — use in server actions where you want to bail immediately.
 */
export async function authorize(permission: Permission): Promise<AuthContext> {
  const result = await tryAuthorize(permission);
  if (!result.authorized) {
    throw new Error(result.error);
  }
  return result.context;
}

/**
 * Same as `authorize()` but returns a result object instead of throwing.
 * Matches the `{ success, error }` pattern used in existing server actions.
 */
export async function tryAuthorize(
  permission: Permission
):Promise<
  | { authorized: true; context: AuthContext }
  | { authorized: false; error: string }
> {
  const { orgId, userId } = await getActiveOrganization();

  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("organization_users")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .single();

  if (!membership) {
    return { authorized: false, error: "You are not a member of this organization" };
  }

  const role = membership.role as MemberRole;

  if (!can(role, permission)) {
    return { authorized: false, error: "You don't have permission to perform this action" };
  }

  return { authorized: true, context: { orgId, userId, role } };
}
