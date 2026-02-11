"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PathSelectionCardProps {
  icon: LucideIcon;
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

export function PathSelectionCard({
  icon: Icon,
  label,
  description,
  selected,
  onSelect,
}: PathSelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex flex-col items-start gap-3 rounded-xl border p-5 text-left transition-all",
        "hover:border-primary/50 hover:bg-accent/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary"
          : "border-border bg-card"
      )}
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-lg transition-colors",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}
      >
        <Icon className="size-5" />
      </div>
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}
