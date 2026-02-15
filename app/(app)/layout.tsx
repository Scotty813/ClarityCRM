import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app/app-header";
import { PermissionsProvider } from "@/lib/hooks/use-permissions";
import type { UserOrganization } from "@/lib/types/database";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, active_org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding/welcome");
  }

  // Fetch user's org memberships
  const { data: memberships } = await supabase
    .from("organization_users")
    .select("role, organization:organizations(id, name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const organizations: UserOrganization[] = (memberships ?? []).map((m) => {
    const org = m.organization;
    return { id: org!.id, name: org!.name, role: m.role };
  });

  // Resolve active org with fallback
  let activeOrgId = profile.active_org_id;
  if (!activeOrgId && organizations.length > 0) {
    activeOrgId = organizations[0].id;
    // Auto-heal
    await supabase
      .from("profiles")
      .update({ active_org_id: activeOrgId })
      .eq("id", user.id);
  }

  const activeRole =
    organizations.find((o) => o.id === activeOrgId)?.role ?? "member";

  return (
    <PermissionsProvider role={activeRole}>
      <AppHeader
        email={user.email ?? ""}
        organizations={organizations}
        activeOrgId={activeOrgId ?? ""}
      />
      {children}
    </PermissionsProvider>
  );
}
