import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrgCreationForm } from "@/components/onboarding/org-creation-form";

export default async function OrganizationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  // If they've already completed onboarding, send them to the dashboard
  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-10">
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
