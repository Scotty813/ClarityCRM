"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEAL_STAGES, STAGE_LABELS } from "@/lib/deals";
import { updateDealStage } from "@/lib/actions/deals";
import { cn } from "@/lib/utils";
import type { DealStage, DealWithRelations } from "@/lib/types/database";

interface DealsKanbanProps {
  deals: DealWithRelations[];
}

const STAGE_COLORS: Record<DealStage, string> = {
  qualified: "bg-secondary text-secondary-foreground",
  proposal: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  negotiation: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  won: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  lost: "bg-destructive/10 text-destructive",
};

export function DealsKanban({ deals }: DealsKanbanProps) {
  const router = useRouter();

  async function handleStageChange(dealId: string, newStage: DealStage) {
    const result = await updateDealStage(dealId, newStage);
    if (!result.success) {
      toast.error(result.error);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {DEAL_STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage);
        const stageTotal = stageDeals.reduce(
          (sum, d) => sum + (d.value ? Number(d.value) : 0),
          0
        );

        return (
          <div
            key={stage}
            className="flex flex-col rounded-lg border bg-muted/30"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn("text-xs", STAGE_COLORS[stage])}
                >
                  {STAGE_LABELS[stage]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {stageDeals.length}
                </span>
              </div>
              {stageTotal > 0 && (
                <span className="text-xs font-medium text-muted-foreground">
                  ${stageTotal.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-2">
              {stageDeals.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground/60">
                  No deals
                </p>
              ) : (
                stageDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="cursor-pointer gap-0 p-3 transition-colors hover:bg-accent/50"
                    onClick={() => router.push(`/deals/${deal.id}`)}
                  >
                    <p className="text-sm font-medium leading-snug">
                      {deal.name}
                    </p>
                    {deal.value !== null && (
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        ${Number(deal.value).toLocaleString()}
                      </p>
                    )}
                    <div className="mt-2 flex flex-col gap-1">
                      {deal.company_name && (
                        <p className="text-xs text-muted-foreground">
                          {deal.company_name}
                        </p>
                      )}
                      {deal.expected_close_date && (
                        <p className="text-xs text-muted-foreground">
                          Close:{" "}
                          {new Date(
                            deal.expected_close_date + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    {deal.owner_name && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {deal.owner_name}
                      </p>
                    )}
                    <div
                      className="mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Select
                        value={deal.stage}
                        onValueChange={(v) =>
                          handleStageChange(deal.id, v as DealStage)
                        }
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DEAL_STAGES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {STAGE_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
