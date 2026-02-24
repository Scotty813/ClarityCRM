"use client";

import { useState, useCallback, useOptimistic, startTransition } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DEAL_STAGES, STAGE_LABELS } from "@/lib/deals";
import { formatCurrency } from "@/lib/format";
import { moveDeal } from "@/lib/actions/deals";
import { cn } from "@/lib/utils";
import { DealCard } from "./deal-card";
import { CloseDealDialog } from "./close-deal-dialog";
import type { DealStage, DealWithRelations } from "@/lib/types/database";

interface DealsKanbanProps {
  deals: DealWithRelations[];
  onDealSelect?: (dealId: string) => void;
}

const STAGE_COLORS: Record<DealStage, string> = {
  qualified: "bg-secondary text-secondary-foreground",
  proposal: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  negotiation: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  won: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  lost: "bg-destructive/10 text-destructive",
};

const TERMINAL_STAGES: DealStage[] = ["won", "lost"];

type OptimisticAction = {
  type: "move";
  dealId: string;
  stage: DealStage;
  reorderedIds: string[];
};

export function DealsKanban({ deals, onDealSelect }: DealsKanbanProps) {
  const [closeDealId, setCloseDealId] = useState<string | null>(null);
  const [closeVariant, setCloseVariant] = useState<"won" | "lost">("won");

  const [optimisticDeals, addOptimistic] = useOptimistic(
    deals,
    (current, action: OptimisticAction) => {
      // Update the moved deal's stage
      const updated = current.map((d) =>
        d.id === action.dealId ? { ...d, stage: action.stage } : d
      );

      // Reorder deals within the destination stage to match reorderedIds
      const destDeals = updated.filter((d) => d.stage === action.stage);
      const orderMap = new Map(
        action.reorderedIds.map((id, i) => [id, i])
      );
      destDeals.sort(
        (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
      );

      // Rebuild the full list: non-destination deals stay in place, destination deals in new order
      const result: DealWithRelations[] = [];
      let destIdx = 0;
      for (const d of updated) {
        if (d.stage === action.stage) {
          result.push(destDeals[destIdx++]);
        } else {
          result.push(d);
        }
      }

      return result;
    }
  );

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { draggableId, source, destination } = result;
      if (!destination) return;

      const newStage = destination.droppableId as DealStage;
      const oldStage = source.droppableId as DealStage;

      // True no-op: same column, same index
      if (oldStage === newStage && source.index === destination.index) return;

      // Terminal stages require confirmation dialog
      if (TERMINAL_STAGES.includes(newStage)) {
        setCloseDealId(draggableId);
        setCloseVariant(newStage as "won" | "lost");
        return;
      }

      // Build new destination column order
      const destDeals = optimisticDeals
        .filter((d) => d.stage === newStage && d.id !== draggableId);
      destDeals.splice(destination.index, 0, optimisticDeals.find((d) => d.id === draggableId)!);
      const reorderedIds = destDeals.map((d) => d.id);

      const stageChanged = oldStage !== newStage;

      startTransition(async () => {
        addOptimistic({
          type: "move",
          dealId: draggableId,
          stage: newStage,
          reorderedIds,
        });
        const res = await moveDeal(draggableId, newStage, reorderedIds);
        if (!res.success) {
          toast.error(res.error);
        } else if (stageChanged) {
          toast.success(`Moved to ${STAGE_LABELS[newStage]}`);
        }
      });
    },
    [optimisticDeals, addOptimistic]
  );

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DEAL_STAGES.map((stage) => {
            const stageDeals = optimisticDeals.filter((d) => d.stage === stage);
            const stageTotal = stageDeals.reduce(
              (sum, d) => sum + (d.value ? Number(d.value) : 0),
              0
            );

            return (
              <Droppable key={stage} droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex flex-col rounded-lg border bg-muted/30 transition-colors",
                      snapshot.isDraggingOver && "border-primary/40 bg-primary/5"
                    )}
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
                          {formatCurrency(stageTotal)}
                        </span>
                      )}
                    </div>

                    <div className="flex min-h-[100px] flex-1 flex-col gap-2 p-2">
                      {stageDeals.length === 0 && !snapshot.isDraggingOver && (
                        <p className="py-8 text-center text-xs text-muted-foreground/60">
                          No deals
                        </p>
                      )}
                      {stageDeals.map((deal, index) => (
                        <Draggable
                          key={deal.id}
                          draggableId={deal.id}
                          index={index}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={cn(
                                "transition-transform",
                                dragSnapshot.isDragging && "scale-[1.02] shadow-lg"
                              )}
                            >
                              <DealCard
                                deal={deal}
                                onClick={() => onDealSelect?.(deal.id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      <CloseDealDialog
        open={!!closeDealId}
        onOpenChange={(open) => {
          if (!open) setCloseDealId(null);
        }}
        dealId={closeDealId}
        variant={closeVariant}
      />
    </>
  );
}
