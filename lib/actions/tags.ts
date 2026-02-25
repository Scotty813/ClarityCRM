"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tryAuthorize } from "@/lib/supabase/authorize";

export async function createTag(name: string, color: string = "gray") {
  const result = await tryAuthorize("company:edit");
  if (!result.authorized) {
    return { success: false as const, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .insert({
      organization_id: orgId,
      name: name.trim(),
      color,
    })
    .select("id, name, color")
    .single();

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/companies");
  return { success: true as const, tag: data };
}

export async function addCompanyTag(companyId: string, tagId: string) {
  const result = await tryAuthorize("company:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("company_tags")
    .insert({ company_id: companyId, tag_id: tagId });

  if (error) {
    if (error.code === "23505") return { success: true }; // already exists
    return { success: false, error: error.message };
  }

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  return { success: true };
}

export async function removeCompanyTag(companyId: string, tagId: string) {
  const result = await tryAuthorize("company:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("company_tags")
    .delete()
    .eq("company_id", companyId)
    .eq("tag_id", tagId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  return { success: true };
}
