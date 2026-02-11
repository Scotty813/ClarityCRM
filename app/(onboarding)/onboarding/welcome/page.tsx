import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { WelcomePathSelector } from "./welcome-path-selector";

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_step, selected_path")
    .eq("id", user.id)
    .single();

  // If they've already completed this step, advance them
  if (profile && profile.onboarding_step > 1) {
    redirect("/onboarding/organization");
  }

  return (
    <div className="flex flex-col gap-10">
      <OnboardingProgress currentStep={1} />

      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          What brings you to ClarityCRM?
        </h1>
        <p className="mt-2 text-muted-foreground">
          This helps us tailor your experience. You can always change this later.
        </p>
      </div>

      <WelcomePathSelector defaultPath={profile?.selected_path ?? undefined} />
    </div>
  );
}
