import { describe, it, expect } from "vitest";
import { can, permissionsForRole, type Permission } from "./permissions";

describe("can()", () => {
  it("grants members read access", () => {
    expect(can("member", "org:read")).toBe(true);
    expect(can("member", "member:read")).toBe(true);
  });

  it("denies members admin-level actions", () => {
    expect(can("member", "member:edit")).toBe(false);
    expect(can("member", "member:invite")).toBe(false);
    expect(can("member", "member:remove")).toBe(false);
    expect(can("member", "org:edit")).toBe(false);
    expect(can("member", "org:switch")).toBe(false);
  });

  it("grants admins invite and remove but not owner-level", () => {
    expect(can("admin", "member:edit")).toBe(true);
    expect(can("admin", "member:invite")).toBe(true);
    expect(can("admin", "member:remove")).toBe(true);
    expect(can("admin", "org:edit")).toBe(true);
    expect(can("admin", "member:edit-role")).toBe(false);
    expect(can("admin", "org:delete")).toBe(false);
    expect(can("admin", "org:switch")).toBe(false);
  });

  it("grants owners everything", () => {
    expect(can("owner", "member:invite")).toBe(true);
    expect(can("owner", "member:edit-role")).toBe(true);
    expect(can("owner", "org:delete")).toBe(true);
    expect(can("owner", "org:switch")).toBe(true);
  });

  it("respects strict hierarchy — higher role inherits all lower permissions", () => {
    const allPermissions: Permission[] = [
      "org:read",
      "org:edit",
      "org:delete",
      "org:switch",
      "member:read",
      "member:edit",
      "member:invite",
      "member:remove",
      "member:edit-role",
      "company:create",
      "company:edit",
      "company:delete",
      "contact:create",
      "contact:edit",
      "contact:delete",
      "deal:create",
      "deal:edit",
      "deal:delete",
    ];

    for (const perm of allPermissions) {
      if (can("member", perm)) {
        expect(can("admin", perm)).toBe(true);
        expect(can("owner", perm)).toBe(true);
      }
      if (can("admin", perm)) {
        expect(can("owner", perm)).toBe(true);
      }
    }
  });
});

describe("permissionsForRole()", () => {
  it("returns only member-level permissions for member", () => {
    const perms = permissionsForRole("member");
    expect(perms).toEqual(
      expect.arrayContaining([
        "org:read",
        "member:read",
        "company:create",
        "company:edit",
        "contact:create",
        "contact:edit",
        "deal:create",
        "deal:edit",
      ])
    );
    expect(perms).toHaveLength(8);
  });

  it("returns admin-level permissions for admin", () => {
    const perms = permissionsForRole("admin");
    expect(perms).toContain("member:invite");
    expect(perms).toContain("member:remove");
    expect(perms).toContain("org:edit");
    expect(perms).toContain("company:delete");
    expect(perms).toContain("contact:delete");
    expect(perms).toContain("deal:delete");
    expect(perms).not.toContain("org:delete");
    expect(perms).not.toContain("org:switch");
    expect(perms).not.toContain("member:edit-role");
  });

  it("returns all permissions for owner", () => {
    const perms = permissionsForRole("owner");
    expect(perms).toHaveLength(18);
  });
});
