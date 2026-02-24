"use client";

import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { DEAL_STAGES, STAGE_LABELS } from "@/lib/deals";
import type { DealStage } from "@/lib/types/database";

export type QuickFilter = "my_deals" | "closing_this_month" | "stale" | "high_value";

export interface DealFilterState {
  search: string;
  owner: string;
  company: string;
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
  companies: SelectOption[];
}

const QUICK_FILTER_OPTIONS: { key: QuickFilter; label: string }[] = [
  { key: "my_deals", label: "My deals" },
  { key: "closing_this_month", label: "Closing this month" },
  { key: "stale", label: "Stale" },
  { key: "high_value", label: "High value" },
];

export function DealFilters({ filters, onChange, members, companies }: DealFiltersProps) {
  const [stageOpen, setStageOpen] = useState(false);
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

        <Select
          value={filters.company || "all"}
          onValueChange={(v) => update({ company: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All companies</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover open={stageOpen} onOpenChange={setStageOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 w-[160px] justify-between font-normal">
              {filters.stages.length === 0
                ? "All stages"
                : `${filters.stages.length} stage${filters.stages.length > 1 ? "s" : ""}`}
              <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {DEAL_STAGES.map((stage) => (
                    <CommandItem
                      key={stage}
                      onSelect={() => toggleStage(stage)}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          filters.stages.includes(stage)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {STAGE_LABELS[stage]}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
