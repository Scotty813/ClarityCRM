"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tryAuthorize } from "@/lib/supabase/authorize";
import type { DealFormData, DealStage } from "@/lib/types/database";

export async function createDeal(data: DealFormData) {
  const result = await tryAuthorize("deal:create");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId, userId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase.from("deals").insert({
    organization_id: orgId,
    created_by: userId,
    name: data.name.trim(),
    value: data.value ? parseFloat(data.value) : null,
    stage: data.stage,
    expected_close_date: data.expected_close_date || null,
    owner_id: userId,
    contact_id: data.contact_id || null,
    company_id: data.company_id || null,
    notes: data.notes.trim() || null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/deals");
  return { success: true };
}

export async function updateDeal(dealId: string, data: DealFormData) {
  const result = await tryAuthorize("deal:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase
    .from("deals")
    .update({
      name: data.name.trim(),
      value: data.value ? parseFloat(data.value) : null,
      stage: data.stage,
      expected_close_date: data.expected_close_date || null,
      owner_id: data.owner_id || null,
      contact_id: data.contact_id || null,
      company_id: data.company_id || null,
      notes: data.notes.trim() || null,
    })
    .eq("id", dealId)
    .eq("organization_id", orgId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/deals");
  revalidatePath(`/deals/${dealId}`);
  return { success: true };
}

export async function updateDealStage(dealId: string, newStage: DealStage) {
  const result = await tryAuthorize("deal:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId, userId } = result.context;
  const supabase = await createClient();

  // Get current stage
  const { data: deal, error: fetchError } = await supabase
    .from("deals")
    .select("stage")
    .eq("id", dealId)
    .eq("organization_id", orgId)
    .single();

  if (fetchError || !deal) {
    return { success: false, error: "Deal not found" };
  }

  if (deal.stage === newStage) {
    return { success: true };
  }

  const fromStage = deal.stage;

  // Update stage
  const { error: updateError } = await supabase
    .from("deals")
    .update({ stage: newStage })
    .eq("id", dealId)
    .eq("organization_id", orgId);

  if (updateError) return { success: false, error: updateError.message };

  // Auto-create stage_change activity
  await supabase.from("deal_activities").insert({
    deal_id: dealId,
    organization_id: orgId,
    activity_type: "stage_change",
    content: null,
    metadata: { from_stage: fromStage, to_stage: newStage },
    created_by: userId,
  });

  revalidatePath("/deals");
  revalidatePath(`/deals/${dealId}`);
  return { success: true };
}

export async function deleteDeal(dealId: string) {
  const result = await tryAuthorize("deal:delete");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("id", dealId)
    .eq("organization_id", orgId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/deals");
  return { success: true };
}
