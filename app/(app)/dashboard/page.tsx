import { createClient } from "@/lib/supabase/server";
import { WelcomeHero } from "@/components/onboarding/welcome-hero";
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, selected_path")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <WelcomeHero
          userName={profile?.full_name ?? null}
          selectedPath={profile?.selected_path ?? null}
        />
        <OnboardingChecklist />
      </div>
    </div>
  );
}
