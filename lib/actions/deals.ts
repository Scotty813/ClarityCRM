"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tryAuthorize } from "@/lib/supabase/authorize";
import type {
  DealFormData,
  DealStage,
  DealUpdatableField,
} from "@/lib/types/database";

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
    position: 0,
    owner_id: userId,
    contact_id: data.contact_id || null,
    company_id: data.company_id || null,
    notes: data.notes.trim() || null,
    lost_reason: data.lost_reason?.trim() || null,
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
      lost_reason: data.lost_reason?.trim() || null,
    })
    .eq("id", dealId)
    .eq("organization_id", orgId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/deals");
  revalidatePath(`/deals/${dealId}`);
  return { success: true };
}

export async function updateDealStage(
  dealId: string,
  newStage: DealStage,
  extra?: { closeDate?: string; lostReason?: string }
) {
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

  // Build update payload
  const updatePayload: Record<string, unknown> = { stage: newStage };
  if (newStage === "won" && extra?.closeDate) {
    updatePayload.expected_close_date = extra.closeDate;
  }
  if (newStage === "lost" && extra?.lostReason) {
    updatePayload.lost_reason = extra.lostReason;
  }

  // Update stage
  const { error: updateError } = await supabase
    .from("deals")
    .update(updatePayload)
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

export async function moveDeal(
  dealId: string,
  newStage: DealStage,
  siblingIds: string[]
) {
  const result = await tryAuthorize("deal:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId, userId } = result.context;
  const supabase = await createClient();

  // Fetch current deal to detect stage change
  const { data: deal, error: fetchError } = await supabase
    .from("deals")
    .select("stage")
    .eq("id", dealId)
    .eq("organization_id", orgId)
    .single();

  if (fetchError || !deal) {
    return { success: false, error: "Deal not found" };
  }

  const stageChanged = deal.stage !== newStage;

  // Update positions for all deals in destination column
  for (let i = 0; i < siblingIds.length; i++) {
    const id = siblingIds[i];
    const update: Record<string, unknown> = { position: i * 1000 };
    if (id === dealId && stageChanged) {
      update.stage = newStage;
    }
    const { error } = await supabase
      .from("deals")
      .update(update)
      .eq("id", id)
      .eq("organization_id", orgId);
    if (error) return { success: false, error: error.message };
  }

  // Log stage change activity
  if (stageChanged) {
    await supabase.from("deal_activities").insert({
      deal_id: dealId,
      organization_id: orgId,
      activity_type: "stage_change",
      content: null,
      metadata: { from_stage: deal.stage, to_stage: newStage },
      created_by: userId,
    });
  }

  revalidatePath("/deals");
  if (stageChanged) {
    revalidatePath(`/deals/${dealId}`);
  }
  return { success: true };
}

export async function updateDealField(
  dealId: string,
  field: DealUpdatableField,
  value: string | number | null
) {
  const result = await tryAuthorize("deal:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  let dbValue: string | number | null = value;
  if (field === "value") {
    dbValue = value !== null && value !== "" ? parseFloat(String(value)) : null;
  }

  const { error } = await supabase
    .from("deals")
    .update({ [field]: dbValue })
    .eq("id", dealId)
    .eq("organization_id", orgId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/deals");
  revalidatePath(`/deals/${dealId}`);
  return { success: true };
}

export async function updateDealContact(
  dealId: string,
  contactId: string | null,
  companyId: string | null
) {
  const result = await tryAuthorize("deal:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase
    .from("deals")
    .update({ contact_id: contactId, company_id: companyId })
    .eq("id", dealId)
    .eq("organization_id", orgId);

  if (error) return { success: false, error: error.message };

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

export async function deleteDeals(ids: string[]) {
  if (ids.length === 0) return { success: false, error: "No deals selected" };

  const result = await tryAuthorize("deal:delete");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  const { error, count } = await supabase
    .from("deals")
    .delete({ count: "exact" })
    .in("id", ids)
    .eq("organization_id", orgId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/deals");
  return { success: true, deleted: count ?? ids.length };
}
