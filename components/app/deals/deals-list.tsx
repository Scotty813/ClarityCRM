"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STAGE_LABELS } from "@/lib/deals";
import { formatRelativeTime, isStale, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DealStage, DealWithRelations } from "@/lib/types/database";

interface DealsListProps {
  deals: DealWithRelations[];
  onDealSelect?: (dealId: string) => void;
}

type SortField = "value" | "expected_close_date" | "last_activity_at";
type SortDirection = "asc" | "desc";

const STAGE_BADGE_VARIANT: Record<
  DealStage,
  {
    variant: "default" | "secondary" | "outline" | "destructive";
    className?: string;
  }
> = {
  qualified: { variant: "secondary" },
  proposal: { variant: "outline" },
  negotiation: { variant: "default" },
  won: {
    variant: "secondary",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  lost: { variant: "destructive" },
};

function SortButton({
  field,
  activeField,
  direction,
  onToggle,
  children,
}: {
  field: SortField;
  activeField: SortField | null;
  direction: SortDirection;
  onToggle: (field: SortField) => void;
  children: React.ReactNode;
}) {
  const active = activeField === field;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => onToggle(field)}
    >
      {children}
      {active ? (
        direction === "asc" ? (
          <ArrowUp className="ml-1 size-3.5" />
        ) : (
          <ArrowDown className="ml-1 size-3.5" />
        )
      ) : (
        <ArrowUpDown className="ml-1 size-3.5 opacity-50" />
      )}
    </Button>
  );
}

export function DealsList({ deals, onDealSelect }: DealsListProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }

  const sorted = useMemo(() => {
    if (!sortField) return deals;
    return [...deals].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      switch (sortField) {
        case "value":
          aVal = a.value !== null ? Number(a.value) : -Infinity;
          bVal = b.value !== null ? Number(b.value) : -Infinity;
          break;
        case "expected_close_date":
          aVal = a.expected_close_date
            ? new Date(a.expected_close_date).getTime()
            : -Infinity;
          bVal = b.expected_close_date
            ? new Date(b.expected_close_date).getTime()
            : -Infinity;
          break;
        case "last_activity_at":
          aVal = a.last_activity_at
            ? new Date(a.last_activity_at).getTime()
            : -Infinity;
          bVal = b.last_activity_at
            ? new Date(b.last_activity_at).getTime()
            : -Infinity;
          break;
      }

      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [deals, sortField, sortDirection]);

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <p className="text-sm text-muted-foreground">
          No deals match your filters
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deal</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>
              <SortButton field="value" activeField={sortField} direction={sortDirection} onToggle={toggleSort}>Amount</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="expected_close_date" activeField={sortField} direction={sortDirection} onToggle={toggleSort}>Close date</SortButton>
            </TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Next step</TableHead>
            <TableHead>
              <SortButton field="last_activity_at" activeField={sortField} direction={sortDirection} onToggle={toggleSort}>Last activity</SortButton>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((deal) => {
            const badge = STAGE_BADGE_VARIANT[deal.stage];
            const stale = isStale(deal.last_activity_at, 14);

            return (
              <TableRow
                key={deal.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onDealSelect?.(deal.id)}
              >
                <TableCell className="font-medium">
                  <Link
                    href={`/deals/${deal.id}`}
                    className="hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {deal.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {deal.company_name ?? "\u2014"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={badge.variant}
                    className={cn(badge.className)}
                  >
                    {STAGE_LABELS[deal.stage]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {deal.value !== null
                    ? formatCurrency(Number(deal.value))
                    : "\u2014"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {deal.expected_close_date
                    ? new Date(
                        deal.expected_close_date + "T00:00:00"
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "\u2014"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {deal.owner_name ?? "\u2014"}
                </TableCell>
                <TableCell>
                  {deal.next_task_title ? (
                    <span className="text-sm text-muted-foreground">
                      {deal.next_task_title}
                      {deal.next_task_due_date && (
                        <span className="ml-1 text-xs">
                          (
                          {new Date(
                            deal.next_task_due_date + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          )
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-sm text-amber-600 dark:text-amber-400">
                      None
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-sm",
                      stale
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatRelativeTime(deal.last_activity_at)}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
