"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { dismissGettingStarted } from "@/lib/actions/dashboard";

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  href?: string;
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
  dismissed: boolean;
}

export function OnboardingChecklist({ items, dismissed }: OnboardingChecklistProps) {
  const [isPending, startTransition] = useTransition();

  if (dismissed) return null;

  const completedCount = items.filter((i) => i.done).length;

  function handleDismiss() {
    startTransition(async () => {
      await dismissGettingStarted();
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">Getting started</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {completedCount} of {items.length} complete
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          disabled={isPending}
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
            width: `${(completedCount / items.length) * 100}%`,
          }}
        />
      </div>

      <ul className="mt-5 grid gap-3">
        {items.map((item) => (
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
            {!item.done && item.href ? (
              <Link
                href={item.href}
                className="text-sm text-foreground hover:underline"
              >
                {item.label}
              </Link>
            ) : (
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
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
