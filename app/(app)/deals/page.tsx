import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/lib/supabase/active-org";
import { DealsView } from "@/components/app/deals/deals-view";
import type { DealWithRelations } from "@/lib/types/database";

export default async function DealsPage() {
  const supabase = await createClient();
  const { orgId } = await getActiveOrganization();

  const [
    { data: deals },
    { data: contacts },
    { data: companies },
    { data: members },
  ] = await Promise.all([
    supabase
      .from("deals")
      .select(
        "*, contacts(first_name, last_name), companies(name), owner:profiles!deals_owner_id_fkey(full_name)"
      )
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .eq("organization_id", orgId)
      .order("last_name", { ascending: true }),
    supabase
      .from("companies")
      .select("id, name")
      .eq("organization_id", orgId)
      .order("name", { ascending: true }),
    supabase
      .from("organization_users")
      .select("user_id, profiles(full_name)")
      .eq("organization_id", orgId),
  ]);

  const enriched: DealWithRelations[] = (deals ?? []).map((d) => {
    const contact = d.contacts as unknown as {
      first_name: string;
      last_name: string;
    } | null;
    const company = d.companies as unknown as { name: string } | null;
    const owner = d.owner as unknown as { full_name: string | null } | null;
    return {
      ...d,
      contact_name: contact
        ? `${contact.first_name} ${contact.last_name}`
        : null,
      company_name: company?.name ?? null,
      owner_name: owner?.full_name ?? null,
    };
  });

  const memberOptions = (members ?? []).map((m) => {
    const profile = m.profiles as unknown as { full_name: string | null };
    return {
      id: m.user_id,
      name: profile?.full_name ?? "Unknown",
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <DealsView
        deals={enriched}
        contacts={
          contacts?.map((c) => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`,
          })) ?? []
        }
        companies={companies ?? []}
        members={memberOptions}
      />
    </div>
  );
}
