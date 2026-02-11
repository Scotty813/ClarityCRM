import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { OrgCreationForm } from "@/components/onboarding/org-creation-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function OrganizationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_step")
    .eq("id", user.id)
    .single();

  // If they haven't completed step 1, send them back
  if (profile && profile.onboarding_step < 2) {
    redirect("/onboarding/welcome");
  }

  // If they've already completed this step, advance them
  if (profile && profile.onboarding_step > 2) {
    redirect("/onboarding/setup");
  }

  return (
    <div className="flex flex-col gap-10">
      <OnboardingProgress currentStep={2} />

      <div>
        <Link
          href="/onboarding/welcome"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Create your workspace
        </h1>
        <p className="mt-2 text-muted-foreground">
          This is where your team will collaborate. You can invite others later.
        </p>
      </div>

      <div className="mx-auto w-full max-w-md">
        <OrgCreationForm />
      </div>
    </div>
  );
}
