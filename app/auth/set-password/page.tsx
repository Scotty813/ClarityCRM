import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SetPasswordForm } from "./set-password-form";

export default async function SetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Only invited users should be here
  if (!user.user_metadata?.invited_to_org) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Set your password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a password so you can sign in to your account.
          </p>
        </div>

        <div className="mt-8">
          <SetPasswordForm />
        </div>
      </div>
    </div>
  );
}
