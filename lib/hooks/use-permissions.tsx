"use client";

import { createContext, useContext, useCallback, useMemo } from "react";
import { can as canCheck, type Permission } from "@/lib/permissions";
import type { MemberRole } from "@/lib/types/database";

interface PermissionsContextValue {
  role: MemberRole;
  can: (permission: Permission) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({
  role,
  children,
}: {
  role: MemberRole;
  children: React.ReactNode;
}) {
  const can = useCallback(
    (permission: Permission) => canCheck(role, permission),
    [role]
  );

  const value = useMemo(() => ({ role, can }), [role, can]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return ctx;
}
