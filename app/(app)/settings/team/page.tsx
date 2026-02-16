import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/lib/supabase/active-org";
import { UsersTable } from "@/components/app/users/users-table";
import type { OrgUser } from "@/lib/types/database";

export default async function SettingsTeamPage() {
  const supabase = await createClient();
  const { orgId } = await getActiveOrganization();

  const [{ data: members }, { data: org }] = await Promise.all([
    supabase
      .from("organization_users")
      .select("id, user_id, role, created_at, profiles(full_name, avatar_url, email)")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: true }),
    supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single(),
  ]);

  const orgUsers: OrgUser[] = (members ?? []).map((m) => {
    const profile = m.profiles as unknown as {
      full_name: string | null;
      avatar_url: string | null;
      email: string | null;
    } | null;

    return {
      id: m.id,
      user_id: m.user_id,
      role: m.role,
      full_name: profile?.full_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
      email: profile?.email ?? null,
      created_at: m.created_at,
    };
  });

  return <UsersTable users={orgUsers} orgName={org?.name ?? "Organization"} />;
}
