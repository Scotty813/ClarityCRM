"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tryAuthorize } from "@/lib/supabase/authorize";
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
