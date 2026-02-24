"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DEAL_STAGES, STAGE_LABELS } from "@/lib/deals";
import { updateDealStage } from "@/lib/actions/deals";
import type { DealStage, DealWithRelations } from "@/lib/types/database";

interface DealStageProgressProps {
  deal: DealWithRelations;
}

export function DealStageProgress({ deal }: DealStageProgressProps) {
  const currentIndex = DEAL_STAGES.indexOf(deal.stage);

  async function handleClick(stage: DealStage) {
    if (stage === deal.stage) return;
    const result = await updateDealStage(deal.id, stage);
    if (!result.success) {
      toast.error(result.error);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex gap-1">
        {DEAL_STAGES.map((stage, i) => {
          const isActive = stage === deal.stage;
          const isPast =
            i < currentIndex &&
            deal.stage !== "won" &&
            deal.stage !== "lost";
          const isWon = deal.stage === "won";
          const isLost = deal.stage === "lost";

          return (
            <button
              key={stage}
              onClick={() => handleClick(stage)}
              className={cn(
                "flex-1 rounded-md py-2 text-center text-xs font-medium transition-colors",
                "hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive && !isWon && !isLost &&
                  "bg-primary text-primary-foreground",
                isPast && "bg-primary/20 text-primary",
                isWon && stage === "won" &&
                  "bg-emerald-500 text-white dark:bg-emerald-600",
                isWon && stage !== "won" &&
                  "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                isLost && stage === "lost" &&
                  "bg-destructive text-white",
                isLost && stage !== "lost" &&
                  "bg-muted text-muted-foreground",
                !isActive && !isPast && !isWon && !isLost &&
                  "bg-muted text-muted-foreground"
              )}
            >
              {STAGE_LABELS[stage]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
