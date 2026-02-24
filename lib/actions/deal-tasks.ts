"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tryAuthorize } from "@/lib/supabase/authorize";
import type { DealTaskFormData } from "@/lib/types/database";

export async function createDealTask(dealId: string, data: DealTaskFormData) {
  const result = await tryAuthorize("deal:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId, userId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase.from("deal_tasks").insert({
    deal_id: dealId,
    organization_id: orgId,
    title: data.title.trim(),
    due_date: data.due_date || null,
    created_by: userId,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/deals");
  return { success: true };
}

export async function toggleDealTask(taskId: string, completed: boolean) {
  const result = await tryAuthorize("deal:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase
    .from("deal_tasks")
    .update({ completed })
    .eq("id", taskId)
    .eq("organization_id", orgId);

  if (error) return { success: false, error: error.message };

  return { success: true };
}

export async function deleteDealTask(taskId: string, dealId: string) {
  const result = await tryAuthorize("deal:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase
    .from("deal_tasks")
    .delete()
    .eq("id", taskId)
    .eq("organization_id", orgId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/deals");
  return { success: true };
}
