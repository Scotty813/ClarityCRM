"use client";

import { Calendar, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatRelativeTime, isStale, formatCurrency } from "@/lib/format";
import type { DealWithRelations } from "@/lib/types/database";

interface DealCardProps {
  deal: DealWithRelations;
  onClick?: () => void;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const stale = isStale(deal.last_activity_at, 14);

  return (
    <Card
      className="cursor-pointer gap-0 p-3 transition-all hover:shadow-md"
      onClick={onClick}
    >
      {/* Name + amount */}
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium leading-snug">
          {deal.name}
        </p>
        {deal.value !== null && (
          <span className="shrink-0 text-sm font-semibold">
            {formatCurrency(Number(deal.value))}
          </span>
        )}
      </div>

      {/* Company */}
      {deal.company_name && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {deal.company_name}
        </p>
      )}

      {/* Close date + owner avatar */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {deal.expected_close_date && (
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(
                deal.expected_close_date + "T00:00:00"
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
        {deal.owner_name && (
          <Avatar className="size-5">
            <AvatarImage src={deal.owner_avatar_url ?? undefined} />
            <AvatarFallback className="text-[10px]">
              {getInitials(deal.owner_name)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Next step / last activity */}
      <div className="mt-2 flex items-center justify-between text-xs">
        {deal.next_task_title ? (
          <span className="truncate text-muted-foreground">
            Next: {deal.next_task_title}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <AlertCircle className="size-3" />
            No next step
          </span>
        )}
        <span
          className={
            stale
              ? "shrink-0 text-amber-600 dark:text-amber-400"
              : "shrink-0 text-muted-foreground"
          }
        >
          {formatRelativeTime(deal.last_activity_at)}
        </span>
      </div>
    </Card>
  );
}
