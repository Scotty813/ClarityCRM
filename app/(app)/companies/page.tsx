import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/lib/supabase/active-org";
import { CompaniesTable } from "@/components/app/companies/companies-table";

export default async function CompaniesPage() {
  const supabase = await createClient();
  const { orgId } = await getActiveOrganization();

  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .eq("organization_id", orgId)
    .order("name", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <CompaniesTable companies={companies ?? []} />
    </div>
  );
}
