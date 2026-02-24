"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS, STAGE_BADGE_COLORS } from "@/lib/deals";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DealWithRelations } from "@/lib/types/database";

interface CompanyDealsTabProps {
  deals: DealWithRelations[];
}

export function CompanyDealsTab({ deals }: CompanyDealsTabProps) {
  if (deals.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <Briefcase className="mx-auto mb-3 size-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No deals for this company yet.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y px-6">
      {deals.map((deal) => (
        <div key={deal.id} className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <Link
              href={`/deals/${deal.id}`}
              className="truncate text-sm font-medium hover:underline"
            >
              {deal.name}
            </Link>
            <div className="mt-0.5 flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  STAGE_BADGE_COLORS[deal.stage]
                )}
              >
                {STAGE_LABELS[deal.stage]}
              </Badge>
              {deal.last_activity_at && (
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(deal.last_activity_at)}
                </span>
              )}
            </div>
          </div>
          <span className="shrink-0 text-sm font-medium tabular-nums">
            {formatCurrency(deal.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
