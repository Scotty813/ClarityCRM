"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { DealsKanban } from "./deals-kanban";
import { DealsList } from "./deals-list";
import { DealFilters, type DealFilterState } from "./deal-filters";
import { CreateDealDialog } from "./create-deal-dialog";
import type { DealWithRelations } from "@/lib/types/database";

interface SelectOption {
  id: string;
  name: string;
}

interface DealsViewProps {
  deals: DealWithRelations[];
  contacts: SelectOption[];
  companies: SelectOption[];
  members: SelectOption[];
}

const EMPTY_FILTERS: DealFilterState = {
  search: "",
  owner: "",
  stages: [],
  closeDateFrom: "",
  closeDateTo: "",
  valueMin: "",
  valueMax: "",
};

export function DealsView({
  deals,
  contacts,
  companies,
  members,
}: DealsViewProps) {
  const { can } = usePermissions();
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState<DealFilterState>(EMPTY_FILTERS);

  const filtered = useMemo(() => {
    return deals.filter((deal) => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match =
          deal.name.toLowerCase().includes(q) ||
          deal.company_name?.toLowerCase().includes(q) ||
          deal.contact_name?.toLowerCase().includes(q) ||
          deal.owner_name?.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Owner
      if (filters.owner && deal.owner_id !== filters.owner) return false;

      // Stages
      if (filters.stages.length > 0 && !filters.stages.includes(deal.stage))
        return false;

      // Close date range
      if (filters.closeDateFrom && deal.expected_close_date) {
        if (deal.expected_close_date < filters.closeDateFrom) return false;
      }
      if (filters.closeDateTo && deal.expected_close_date) {
        if (deal.expected_close_date > filters.closeDateTo) return false;
      }

      // Value range
      if (filters.valueMin && deal.value !== null) {
        if (Number(deal.value) < Number(filters.valueMin)) return false;
      }
      if (filters.valueMax && deal.value !== null) {
        if (Number(deal.value) > Number(filters.valueMax)) return false;
      }

      return true;
    });
  }, [deals, filters]);

  const totalValue = filtered.reduce(
    (sum, d) => sum + (d.value ? Number(d.value) : 0),
    0
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Deals</h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "deal" : "deals"}
              {totalValue > 0 && (
                <span className="ml-1">
                  &middot; ${totalValue.toLocaleString()} total pipeline
                </span>
              )}
            </p>
          </div>
          {can("deal:create") && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Add Deal
            </Button>
          )}
        </div>

        <DealFilters
          filters={filters}
          onChange={setFilters}
          members={members}
        />

        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
          <TabsContent value="kanban" className="mt-4">
            <DealsKanban deals={filtered} />
          </TabsContent>
          <TabsContent value="list" className="mt-4">
            <DealsList deals={filtered} />
          </TabsContent>
        </Tabs>
      </div>

      <CreateDealDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        contacts={contacts}
        companies={companies}
        members={members}
      />
    </>
  );
}
