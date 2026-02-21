import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/app/settings/profile-form";

export default async function SettingsProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, avatar_url, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Profile not found");

  return (
    <ProfileForm
      firstName={profile.first_name ?? ""}
      lastName={profile.last_name ?? ""}
      email={profile.email ?? user.email ?? ""}
      avatarUrl={profile.avatar_url}
      createdAt={profile.created_at}
    />
  );
}
