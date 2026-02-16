"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tryAuthorize } from "@/lib/supabase/authorize";
import type { ContactFormData } from "@/lib/types/database";

export async function createContact(data: ContactFormData) {
  const result = await tryAuthorize("contact:create");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId, userId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase.from("contacts").insert({
    organization_id: orgId,
    created_by: userId,
    first_name: data.first_name.trim(),
    last_name: data.last_name.trim(),
    email: data.email.trim() || null,
    phone: data.phone.trim() || null,
    job_title: data.job_title.trim() || null,
    company_id: data.company_id || null,
    notes: data.notes.trim() || null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/contacts");
  return { success: true };
}

export async function updateContact(contactId: string, data: ContactFormData) {
  const result = await tryAuthorize("contact:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase
    .from("contacts")
    .update({
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim() || null,
      phone: data.phone.trim() || null,
      job_title: data.job_title.trim() || null,
      company_id: data.company_id || null,
      notes: data.notes.trim() || null,
    })
    .eq("id", contactId)
    .eq("organization_id", orgId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/contacts");
  return { success: true };
}

export async function deleteContact(contactId: string) {
  const result = await tryAuthorize("contact:delete");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", contactId)
    .eq("organization_id", orgId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/contacts");
  return { success: true };
}
