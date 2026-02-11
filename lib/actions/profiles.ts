"use server";

import { createClient } from "@/lib/supabase/server";
import type { SelectedPath } from "@/lib/constants/onboarding";

export async function updateSelectedPath(path: SelectedPath) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ selected_path: path, onboarding_step: 2 })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}

export async function updateOnboardingStep(step: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_step: step })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}

export async function completeOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true, onboarding_step: 4 })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}
