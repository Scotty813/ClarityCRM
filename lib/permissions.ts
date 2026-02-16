import type { MemberRole } from "@/lib/types/database";

/**
 * Role hierarchy — higher number = more access.
 */
const ROLE_LEVEL: Record<MemberRole, number> = {
  member: 0,
  admin: 1,
  owner: 2,
} as const;

/**
 * Every permission in the app and the minimum role required.
 * Adding a permission = 1 line. Adding a role = 1 line + review.
 */
const PERMISSION_LEVEL = {
  // Organization
  "org:read": "member",
  "org:edit": "admin",
  "org:delete": "owner",
  "org:switch": "owner",

  // Members
  "member:read": "member",
  "member:invite": "admin",
  "member:remove": "admin",
  "member:edit-role": "owner",

  // Companies
  "company:create": "member",
  "company:edit": "member",
  "company:delete": "admin",

  // Contacts
  "contact:create": "member",
  "contact:edit": "member",
  "contact:delete": "admin",
} as const satisfies Record<string, MemberRole>;

export type Permission = keyof typeof PERMISSION_LEVEL;

/**
 * Check whether a role has a given permission.
 */
export function can(role: MemberRole, permission: Permission): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[PERMISSION_LEVEL[permission]];
}

/**
 * Return all permissions granted to a role.
 */
export function permissionsForRole(role: MemberRole): Permission[] {
  return (Object.keys(PERMISSION_LEVEL) as Permission[]).filter((p) =>
    can(role, p)
  );
}
