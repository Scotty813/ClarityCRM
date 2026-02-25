"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { isStale } from "@/lib/format";
import { DealsKanban } from "./deals-kanban";
import { DealsList } from "./deals-list";
import { DealFilters, type DealFilterState } from "./deal-filters";
import { CreateDealDialog } from "./create-deal-dialog";
import { EditDealDialog } from "./edit-deal-dialog";
import { DealDetailDrawer } from "./deal-detail-drawer";
import type { DealWithRelations } from "@/lib/types/database";

interface SelectOption {
  id: string;
  name: string;
}

interface ContactOption {
  id: string;
  name: string;
  email?: string | null;
  company_id?: string | null;
}

interface MemberOption {
  id: string;
  name: string;
  avatar_url?: string | null;
}

interface DealsViewProps {
  deals: DealWithRelations[];
  contacts: ContactOption[];
  companies: SelectOption[];
  members: MemberOption[];
  currentUserId: string;
}

const EMPTY_FILTERS: DealFilterState = {
  search: "",
  owner: "",
  company: "",
  stages: [],
  closeDateFrom: "",
  closeDateTo: "",
  valueMin: "",
  valueMax: "",
  quickFilters: [],
};

export function DealsView({
  deals,
  contacts,
  companies,
  members,
  currentUserId,
}: DealsViewProps) {
  const { can } = usePermissions();
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState<DealFilterState>(EMPTY_FILTERS);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const editingDeal = deals.find((d) => d.id === editingDealId);

  const filtered = useMemo(() => {
    return deals.filter((deal) => {
      // Quick filters (additive AND logic)
      if (filters.quickFilters.includes("my_deals")) {
        if (deal.owner_id !== currentUserId) return false;
      }
      if (filters.quickFilters.includes("closing_this_month")) {
        if (!deal.expected_close_date) return false;
        const now = new Date();
        const closeDate = new Date(deal.expected_close_date + "T00:00:00");
        if (
          closeDate.getMonth() !== now.getMonth() ||
          closeDate.getFullYear() !== now.getFullYear()
        )
          return false;
      }
      if (filters.quickFilters.includes("stale")) {
        if (!isStale(deal.last_activity_at, 14)) return false;
      }
      if (filters.quickFilters.includes("high_value")) {
        if (!deal.value || Number(deal.value) < 10000) return false;
      }

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

      // Company
      if (filters.company && deal.company_id !== filters.company) return false;

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
  }, [deals, filters, currentUserId]);

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
          companies={companies}
        />

        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
          <TabsContent value="kanban" className="mt-4">
            <DealsKanban
              deals={filtered}
              onDealSelect={setSelectedDealId}
            />
          </TabsContent>
          <TabsContent value="list" className="mt-4">
            <DealsList
              deals={filtered}
              onDealSelect={setSelectedDealId}
              onEditDeal={setEditingDealId}
            />
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

      {editingDeal && (
        <EditDealDialog
          open={!!editingDealId}
          onOpenChange={(open) => {
            if (!open) setEditingDealId(null);
          }}
          deal={editingDeal}
          contacts={contacts}
          companies={companies}
          members={members}
        />
      )}

      <DealDetailDrawer
        dealId={selectedDealId}
        onClose={() => setSelectedDealId(null)}
      />
    </>
  );
}
