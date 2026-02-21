"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileFormSchema } from "@/lib/validations/profile";
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

export async function updateProfile(data: { first_name: string; last_name: string }) {
  const parsed = profileFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.first_name.trim(),
      last_name: parsed.data.last_name.trim() || null,
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings/profile");
  revalidatePath("/dashboard");
  revalidatePath("/settings/team");
  return { success: true };
}
