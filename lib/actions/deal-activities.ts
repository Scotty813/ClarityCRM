"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tryAuthorize } from "@/lib/supabase/authorize";
import { can } from "@/lib/permissions";
import type { DealActivityType } from "@/lib/types/database";

export async function createDealActivity(
  dealId: string,
  activityType: DealActivityType,
  content: string
) {
  const result = await tryAuthorize("deal:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId, userId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase.from("deal_activities").insert({
    deal_id: dealId,
    organization_id: orgId,
    activity_type: activityType,
    content: content.trim() || null,
    created_by: userId,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/deals");
  return { success: true };
}

export async function updateDealActivity(activityId: string, content: string) {
  const result = await tryAuthorize("deal:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId, userId, role } = result.context;
  const supabase = await createClient();

  const { data: activity } = await supabase
    .from("deal_activities")
    .select("id, deal_id, organization_id, activity_type, created_by")
    .eq("id", activityId)
    .single();

  if (!activity || activity.organization_id !== orgId) {
    return { success: false, error: "Activity not found" };
  }
  if (activity.activity_type === "stage_change") {
    return { success: false, error: "Stage changes cannot be edited" };
  }
  if (activity.created_by !== userId && !can(role, "deal:delete")) {
    return { success: false, error: "You can only edit your own activities" };
  }

  const { error } = await supabase
    .from("deal_activities")
    .update({ content: content.trim() || null })
    .eq("id", activityId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/deals/${activity.deal_id}`);
  revalidatePath("/deals");
  return { success: true };
}

export async function deleteDealActivity(activityId: string, dealId: string) {
  const result = await tryAuthorize("deal:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId, userId, role } = result.context;
  const supabase = await createClient();

  const { data: activity } = await supabase
    .from("deal_activities")
    .select("id, organization_id, activity_type, created_by")
    .eq("id", activityId)
    .single();

  if (!activity || activity.organization_id !== orgId) {
    return { success: false, error: "Activity not found" };
  }
  if (activity.activity_type === "stage_change") {
    return { success: false, error: "Stage changes cannot be deleted" };
  }
  if (activity.created_by !== userId && !can(role, "deal:delete")) {
    return { success: false, error: "You can only delete your own activities" };
  }

  const { error } = await supabase
    .from("deal_activities")
    .delete()
    .eq("id", activityId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/deals");
  return { success: true };
}
