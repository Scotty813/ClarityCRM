"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { isStale } from "@/lib/format";
import { CompaniesTable } from "./companies-table";
import { CompanyFilters } from "./company-filters";
import { CreateCompanyDialog } from "./create-company-dialog";
import { CompanyDetailDrawer } from "./company-detail-drawer";
import type {
  CompanyWithRelations,
  CompanyFilterState,
  CompanySortField,
} from "@/lib/types/database";

interface SelectOption {
  id: string;
  name: string;
}

interface MemberOption extends SelectOption {
  avatar_url?: string | null;
}

interface CompaniesViewProps {
  companies: CompanyWithRelations[];
  members: MemberOption[];
  currentUserId: string;
  totalCount: number;
}

const EMPTY_FILTERS: CompanyFilterState = {
  search: "",
  owner: "",
  lifecycleStages: [],
  quickFilters: [],
  sort: "last_activity",
};

function sortCompanies(
  companies: CompanyWithRelations[],
  sort: CompanySortField
): CompanyWithRelations[] {
  const sorted = [...companies];
  switch (sort) {
    case "last_activity":
      return sorted.sort((a, b) => {
        if (!a.last_activity_at && !b.last_activity_at) return 0;
        if (!a.last_activity_at) return 1;
        if (!b.last_activity_at) return -1;
        return (
          new Date(b.last_activity_at).getTime() -
          new Date(a.last_activity_at).getTime()
        );
      });
    case "pipeline_value":
      return sorted.sort((a, b) => b.pipeline_value - a.pipeline_value);
    case "created_at":
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export function CompaniesView({
  companies,
  members,
  currentUserId,
  totalCount,
}: CompaniesViewProps) {
  const { can } = usePermissions();
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState<CompanyFilterState>(EMPTY_FILTERS);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  );

  const filtered = useMemo(() => {
    const result = companies.filter((company) => {
      // Quick filters
      if (filters.quickFilters.includes("my_accounts")) {
        if (company.owner_id !== currentUserId) return false;
      }
      if (filters.quickFilters.includes("needs_followup")) {
        if (
          !isStale(company.last_activity_at, 7) ||
          company.open_deals_count === 0
        )
          return false;
      }
      if (filters.quickFilters.includes("no_activity_30d")) {
        if (!isStale(company.last_activity_at, 30)) return false;
      }
      if (filters.quickFilters.includes("high_value")) {
        if (company.pipeline_value < 10000) return false;
      }

      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match =
          company.name.toLowerCase().includes(q) ||
          company.domain?.toLowerCase().includes(q) ||
          company.industry?.toLowerCase().includes(q) ||
          company.owner_name?.toLowerCase().includes(q) ||
          company.tags.some((t) => t.name.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Owner
      if (filters.owner && company.owner_id !== filters.owner) return false;

      // Lifecycle stages
      if (
        filters.lifecycleStages.length > 0 &&
        !filters.lifecycleStages.includes(company.lifecycle_stage)
      )
        return false;

      return true;
    });

    return sortCompanies(result, filters.sort);
  }, [companies, filters, currentUserId]);

  const totalPipeline = filtered.reduce(
    (sum, c) => sum + c.pipeline_value,
    0
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Companies
            </h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} of {totalCount}{" "}
              {totalCount === 1 ? "company" : "companies"}
              {totalPipeline > 0 && (
                <span className="ml-1">
                  &middot; ${totalPipeline.toLocaleString()} pipeline
                </span>
              )}
            </p>
          </div>
          {can("company:create") && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Add Company
            </Button>
          )}
        </div>

        <CompanyFilters
          filters={filters}
          onChange={setFilters}
          members={members}
        />

        <CompaniesTable
          companies={filtered}
          onCompanySelect={setSelectedCompanyId}
        />
      </div>

      <CreateCompanyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        members={members}
      />

      <CompanyDetailDrawer
        companyId={selectedCompanyId}
        onClose={() => setSelectedCompanyId(null)}
      />
    </>
  );
}
