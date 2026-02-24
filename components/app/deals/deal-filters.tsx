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
import { DEAL_STAGES, STAGE_LABELS } from "@/lib/deals";
import type { DealStage } from "@/lib/types/database";

export type QuickFilter = "my_deals" | "closing_this_month" | "stale" | "high_value";

export interface DealFilterState {
  search: string;
  owner: string;
  stages: DealStage[];
  closeDateFrom: string;
  closeDateTo: string;
  valueMin: string;
  valueMax: string;
  quickFilters: QuickFilter[];
}

interface SelectOption {
  id: string;
  name: string;
}

interface DealFiltersProps {
  filters: DealFilterState;
  onChange: (filters: DealFilterState) => void;
  members: SelectOption[];
}

const QUICK_FILTER_OPTIONS: { key: QuickFilter; label: string }[] = [
  { key: "my_deals", label: "My deals" },
  { key: "closing_this_month", label: "Closing this month" },
  { key: "stale", label: "Stale" },
  { key: "high_value", label: "High value" },
];

export function DealFilters({ filters, onChange, members }: DealFiltersProps) {
  function update(patch: Partial<DealFilterState>) {
    onChange({ ...filters, ...patch });
  }

  function toggleStage(stage: DealStage) {
    const stages = filters.stages.includes(stage)
      ? filters.stages.filter((s) => s !== stage)
      : [...filters.stages, stage];
    update({ stages });
  }

  function toggleQuickFilter(key: QuickFilter) {
    const quickFilters = filters.quickFilters.includes(key)
      ? filters.quickFilters.filter((f) => f !== key)
      : [...filters.quickFilters, key];
    update({ quickFilters });
  }

  return (
    <div className="space-y-3">
      {/* Quick filter chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTER_OPTIONS.map(({ key, label }) => (
          <Button
            key={key}
            variant={filters.quickFilters.includes(key) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleQuickFilter(key)}
            className="h-7 text-xs"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Existing filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search deals..."
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
          {DEAL_STAGES.filter((s) => s !== "won" && s !== "lost").map((stage) => (
            <Badge
              key={stage}
              variant={filters.stages.includes(stage) ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={() => toggleStage(stage)}
            >
              {STAGE_LABELS[stage]}
            </Badge>
          ))}
          <Badge
            variant={filters.stages.includes("won") ? "default" : "outline"}
            className="cursor-pointer select-none"
            onClick={() => toggleStage("won")}
          >
            Won
          </Badge>
          <Badge
            variant={filters.stages.includes("lost") ? "destructive" : "outline"}
            className="cursor-pointer select-none"
            onClick={() => toggleStage("lost")}
          >
            Lost
          </Badge>
        </div>
      </div>
    </div>
  );
}
