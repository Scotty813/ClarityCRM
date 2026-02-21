"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tryAuthorize } from "@/lib/supabase/authorize";
import type { CompanyFormData, CompanyUpdatableField } from "@/lib/types/database";

export async function createCompany(data: CompanyFormData) {
  const result = await tryAuthorize("company:create");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId, userId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase.from("companies").insert({
    organization_id: orgId,
    created_by: userId,
    name: data.name.trim(),
    domain: data.domain.trim() || null,
    industry: data.industry.trim() || null,
    phone: data.phone.trim() || null,
    address_line1: data.address_line1.trim() || null,
    address_line2: data.address_line2.trim() || null,
    city: data.city.trim() || null,
    state: data.state.trim() || null,
    postal_code: data.postal_code.trim() || null,
    country: data.country.trim() || null,
    notes: data.notes.trim() || null,
    owner_id: data.owner_id || null,
    lifecycle_stage: data.lifecycle_stage,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/companies");
  return { success: true };
}

export async function updateCompany(companyId: string, data: CompanyFormData) {
  const result = await tryAuthorize("company:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase
    .from("companies")
    .update({
      name: data.name.trim(),
      domain: data.domain.trim() || null,
      industry: data.industry.trim() || null,
      phone: data.phone.trim() || null,
      address_line1: data.address_line1.trim() || null,
      address_line2: data.address_line2.trim() || null,
      city: data.city.trim() || null,
      state: data.state.trim() || null,
      postal_code: data.postal_code.trim() || null,
      country: data.country.trim() || null,
      notes: data.notes.trim() || null,
      owner_id: data.owner_id || null,
      lifecycle_stage: data.lifecycle_stage,
    })
    .eq("id", companyId)
    .eq("organization_id", orgId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/companies");
  return { success: true };
}

export async function updateCompanyField(
  companyId: string,
  field: CompanyUpdatableField,
  value: string | null
) {
  const result = await tryAuthorize("company:edit");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase
    .from("companies")
    .update({ [field]: value })
    .eq("id", companyId)
    .eq("organization_id", orgId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/companies");
  return { success: true };
}

export async function deleteCompany(companyId: string) {
  const result = await tryAuthorize("company:delete");
  if (!result.authorized) {
    return { success: false, error: result.error };
  }

  const { orgId } = result.context;
  const supabase = await createClient();

  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", companyId)
    .eq("organization_id", orgId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/companies");
  return { success: true };
}
