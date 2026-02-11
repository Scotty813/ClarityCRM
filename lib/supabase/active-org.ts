import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getActiveOrganization(): Promise<{ orgId: string; userId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_org_id")
    .eq("id", user.id)
    .single();

  if (profile?.active_org_id) {
    return { orgId: profile.active_org_id, userId: user.id };
  }

  // Fallback: pick the user's oldest org membership and auto-heal
  const { data: membership } = await supabase
    .from("organization_users")
    .select("organization_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!membership) {
    redirect("/onboarding/welcome");
  }

  // Auto-heal: set active_org_id
  await supabase
    .from("profiles")
    .update({ active_org_id: membership.organization_id })
    .eq("id", user.id);

  return { orgId: membership.organization_id, userId: user.id };
}
