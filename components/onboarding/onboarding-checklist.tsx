"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const checklistItems = [
  { id: "account", label: "Create account", done: true },
  { id: "workspace", label: "Set up workspace", done: true },
  { id: "contact", label: "Add first contact", done: false },
  { id: "pipeline", label: "Create pipeline", done: false },
  { id: "invite", label: "Invite teammate", done: false },
] as const;

export function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const completedCount = checklistItems.filter((i) => i.done).length;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">Getting started</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {completedCount} of {checklistItems.length} complete
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss checklist"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{
            width: `${(completedCount / checklistItems.length) * 100}%`,
          }}
        />
      </div>

      <ul className="mt-5 grid gap-3">
        {checklistItems.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full",
                item.done
                  ? "bg-primary text-primary-foreground"
                  : "border border-border"
              )}
            >
              {item.done && <Check className="size-3" />}
            </div>
            <span
              className={cn(
                "text-sm",
                item.done
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>

      <Button variant="outline" size="sm" className="mt-5 w-full" disabled>
        Add sample data
      </Button>
    </div>
  );
}
