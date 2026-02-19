"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STAGE_LABELS } from "@/lib/deals";
import { cn } from "@/lib/utils";
import type { DealStage, DealWithRelations } from "@/lib/types/database";

interface DealsListProps {
  deals: DealWithRelations[];
}

const STAGE_BADGE_VARIANT: Record<
  DealStage,
  { variant: "default" | "secondary" | "outline" | "destructive"; className?: string }
> = {
  qualified: { variant: "secondary" },
  proposal: { variant: "outline" },
  negotiation: { variant: "default" },
  won: {
    variant: "secondary",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  lost: { variant: "destructive" },
};

export function DealsList({ deals }: DealsListProps) {
  const router = useRouter();

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
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Close Date</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => {
            const badge = STAGE_BADGE_VARIANT[deal.stage];
            return (
              <TableRow
                key={deal.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/deals/${deal.id}`)}
              >
                <TableCell className="font-medium">{deal.name}</TableCell>
                <TableCell>
                  {deal.value !== null
                    ? `$${Number(deal.value).toLocaleString()}`
                    : "\u2014"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={badge.variant}
                    className={cn(badge.className)}
                  >
                    {STAGE_LABELS[deal.stage]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {deal.company_name ?? "\u2014"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {deal.contact_name ?? "\u2014"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {deal.owner_name ?? "\u2014"}
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
                  {new Date(deal.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
