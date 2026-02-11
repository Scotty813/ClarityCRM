import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { SetupTaskCard } from "@/components/onboarding/setup-task-card";
import { SetupContinueButton } from "./setup-continue-button";
import { UserPlus, Kanban, Mail } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SetupPage() {
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

  if (profile && profile.onboarding_step < 3) {
    redirect("/onboarding/organization");
  }

  return (
    <div className="flex flex-col gap-10">
      <OnboardingProgress currentStep={3} />

      <div>
        <Link
          href="/onboarding/organization"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Let&apos;s set you up in 60 seconds
        </h1>
        <p className="mt-2 text-muted-foreground">
          These optional steps help you get the most out of ClarityCRM. You can
          skip them for now.
        </p>
      </div>

      <div className="grid gap-3">
        <SetupTaskCard
          icon={UserPlus}
          title="Add your first contact"
          description="Import or manually add a contact to get started."
        />
        <SetupTaskCard
          icon={Kanban}
          title="Create your first pipeline"
          description="Set up stages to track your deals from start to finish."
        />
        <SetupTaskCard
          icon={Mail}
          title="Connect email & calendar"
          description="Sync your email and calendar for seamless follow-ups."
        />
      </div>

      <SetupContinueButton />
    </div>
  );
}
