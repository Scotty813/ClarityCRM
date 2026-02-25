"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileFormSchema } from "@/lib/validations/profile";

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
