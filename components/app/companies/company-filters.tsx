"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LIFECYCLE_STAGES, LIFECYCLE_LABELS } from "@/lib/companies";
import type {
  CompanyFilterState,
  CompanyQuickFilter,
  CompanySortField,
  LifecycleStage,
} from "@/lib/types/database";

interface SelectOption {
  id: string;
  name: string;
}

interface CompanyFiltersProps {
  filters: CompanyFilterState;
  onChange: (filters: CompanyFilterState) => void;
  members: SelectOption[];
}

const QUICK_FILTER_OPTIONS: { key: CompanyQuickFilter; label: string }[] = [
  { key: "my_accounts", label: "My accounts" },
  { key: "needs_followup", label: "Needs follow-up" },
  { key: "no_activity_30d", label: "No activity 30d" },
  { key: "high_value", label: "High value" },
];

const SORT_OPTIONS: { value: CompanySortField; label: string }[] = [
  { value: "last_activity", label: "Last activity" },
  { value: "pipeline_value", label: "Pipeline value" },
  { value: "created_at", label: "Recently created" },
  { value: "name", label: "Company name" },
];

export function CompanyFilters({
  filters,
  onChange,
  members,
}: CompanyFiltersProps) {
  function update(patch: Partial<CompanyFilterState>) {
    onChange({ ...filters, ...patch });
  }

  function toggleLifecycle(stage: LifecycleStage) {
    const stages = filters.lifecycleStages.includes(stage)
      ? filters.lifecycleStages.filter((s) => s !== stage)
      : [...filters.lifecycleStages, stage];
    update({ lifecycleStages: stages });
  }

  function toggleQuickFilter(key: CompanyQuickFilter) {
    const quickFilters = filters.quickFilters.includes(key)
      ? filters.quickFilters.filter((f) => f !== key)
      : [...filters.quickFilters, key];
    update({ quickFilters });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTER_OPTIONS.map(({ key, label }) => (
          <Button
            key={key}
            variant={
              filters.quickFilters.includes(key) ? "default" : "outline"
            }
            size="sm"
            onClick={() => toggleQuickFilter(key)}
            className="h-7 text-xs"
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.owner || "all"}
          onValueChange={(v) => update({ owner: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All owners</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-1.5">
          {LIFECYCLE_STAGES.map((stage) => (
            <Badge
              key={stage}
              variant={
                filters.lifecycleStages.includes(stage) ? "default" : "outline"
              }
              className="cursor-pointer select-none"
              onClick={() => toggleLifecycle(stage)}
            >
              {LIFECYCLE_LABELS[stage]}
            </Badge>
          ))}
        </div>

        <Select
          value={filters.sort}
          onValueChange={(v) => update({ sort: v as CompanySortField })}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
