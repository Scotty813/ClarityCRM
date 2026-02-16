import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/lib/supabase/active-org";
import { ContactsTable } from "@/components/app/contacts/contacts-table";
import type { ContactWithCompany } from "@/lib/types/database";

export default async function ContactsPage() {
  const supabase = await createClient();
  const { orgId } = await getActiveOrganization();

  const [{ data: contacts }, { data: companies }] = await Promise.all([
    supabase
      .from("contacts")
      .select("*, companies(name)")
      .eq("organization_id", orgId)
      .order("last_name", { ascending: true }),
    supabase
      .from("companies")
      .select("id, name")
      .eq("organization_id", orgId)
      .order("name", { ascending: true }),
  ]);

  const enriched: ContactWithCompany[] = (contacts ?? []).map((c) => {
    const company = c.companies as unknown as { name: string } | null;
    return {
      ...c,
      company_name: company?.name ?? null,
    };
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <ContactsTable
        contacts={enriched}
        companies={companies ?? []}
      />
    </div>
  );
}
