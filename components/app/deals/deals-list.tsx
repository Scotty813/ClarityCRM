"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { deleteDeal, deleteDeals } from "@/lib/actions/deals";
import { useRowSelection } from "@/lib/hooks/use-row-selection";
import { BulkActionBar } from "@/components/app/shared/bulk-action-bar";
import { STAGE_LABELS } from "@/lib/deals";
import { formatRelativeTime, isStale, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DealStage, DealWithRelations } from "@/lib/types/database";

interface DealsListProps {
  deals: DealWithRelations[];
  onDealSelect?: (dealId: string) => void;
  onEditDeal?: (dealId: string) => void;
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

export function DealsList({ deals, onDealSelect, onEditDeal }: DealsListProps) {
  const { can } = usePermissions();
  const canDelete = can("deal:delete");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isDeleting, setIsDeleting] = useState(false);

  const dealIds = useMemo(() => deals.map((d) => d.id), [deals]);
  const selection = useRowSelection(dealIds);

  async function handleDelete(e: React.MouseEvent, deal: DealWithRelations) {
    e.stopPropagation();
    if (!confirm(`Delete "${deal.name}"? This cannot be undone.`)) return;

    const result = await deleteDeal(deal.id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Deal deleted");
    }
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selection.count} deal${selection.count === 1 ? "" : "s"}? This cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      const result = await deleteDeals(selection.selectedIds);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(`${result.deleted} deal${result.deleted === 1 ? "" : "s"} deleted`);
        selection.clear();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  }

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
    <>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {canDelete && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={selection.isAllSelected ? true : selection.isSomeSelected ? "indeterminate" : false}
                    onCheckedChange={() => selection.toggleAll()}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
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
              <TableHead className="w-10" />
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
                  {canDelete && (
                    <TableCell>
                      <Checkbox
                        checked={selection.selectedIds.includes(deal.id)}
                        onCheckedChange={() => selection.toggle(deal.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${deal.name}`}
                      />
                    </TableCell>
                  )}
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {can("deal:edit") && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditDeal?.(deal.id);
                            }}
                          >
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => handleDelete(e, deal)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {canDelete && (
        <BulkActionBar
          count={selection.count}
          onDelete={handleBulkDelete}
          onClear={selection.clear}
          isDeleting={isDeleting}
          entityName="deal"
        />
      )}
    </>
  );
}
