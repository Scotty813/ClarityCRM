"use client";

import { Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  count: number;
  onDelete: () => void;
  onClear: () => void;
  isDeleting: boolean;
  entityName: string;
}

export function BulkActionBar({
  count,
  onDelete,
  onClear,
  isDeleting,
  entityName,
}: BulkActionBarProps) {
  if (count === 0) return null;

  const label = count === 1 ? entityName : `${entityName}s`;

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center pointer-events-none">
      <div
        role="toolbar"
        aria-label="Bulk actions"
        className="pointer-events-auto flex items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-lg"
      >
        <span className="text-sm font-medium tabular-nums">
          {count} {label} selected
        </span>

        <div className="h-4 w-px bg-border" />

        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded-full"
        >
          {isDeleting ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <Trash2 className="mr-1.5 size-3.5" />
          )}
          Delete
        </Button>

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClear}
          disabled={isDeleting}
          className="rounded-full"
          aria-label="Clear selection"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
