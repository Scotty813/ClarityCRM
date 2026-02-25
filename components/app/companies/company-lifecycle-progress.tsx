"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LIFECYCLE_STAGES, LIFECYCLE_LABELS } from "@/lib/companies";
import { updateCompanyField } from "@/lib/actions/companies";
import type { CompanyWithRelations, LifecycleStage } from "@/lib/types/database";

interface CompanyLifecycleProgressProps {
  company: CompanyWithRelations;
}

export function CompanyLifecycleProgress({
  company,
}: CompanyLifecycleProgressProps) {
  const currentIndex = LIFECYCLE_STAGES.indexOf(company.lifecycle_stage);

  async function handleClick(stage: LifecycleStage) {
    if (stage === company.lifecycle_stage) return;
    const result = await updateCompanyField(company.id, "lifecycle_stage", stage);
    if (!result.success) {
      toast.error(result.error);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex gap-1">
        {LIFECYCLE_STAGES.map((stage, i) => {
          const isActive = stage === company.lifecycle_stage;
          const isChurned = company.lifecycle_stage === "churned";
          const isPast =
            i < currentIndex && !isChurned;

          return (
            <button
              key={stage}
              onClick={() => handleClick(stage)}
              className={cn(
                "flex-1 rounded-md py-2 text-center text-xs font-medium transition-colors",
                "hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive && !isChurned && stage !== "churned" &&
                  "bg-primary text-primary-foreground",
                isActive && stage === "churned" &&
                  "bg-destructive text-white",
                isPast && "bg-primary/20 text-primary",
                isChurned && !isActive &&
                  "bg-muted text-muted-foreground",
                !isActive && !isPast && !isChurned &&
                  "bg-muted text-muted-foreground"
              )}
            >
              {LIFECYCLE_LABELS[stage]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
