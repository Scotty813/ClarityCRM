"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

export interface InlineEditFieldProps {
  icon: LucideIcon;
  label: string;
  value: string | number | null;
  placeholder: string;
  type: "currency" | "date";
  onSave: (value: string | null) => void;
}

function formatDisplay(
  value: string | number | null,
  type: "currency" | "date"
): string | null {
  if (value === null || value === "") return null;
  if (type === "currency") {
    return formatCurrency(Number(value));
  }
  // date — value is an ISO date string like "2025-06-15"
  return new Date(value + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function InlineEditField({
  icon: Icon,
  label,
  value,
  placeholder,
  type,
  onSave,
}: InlineEditFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive the raw editable string from prop value
  const rawValue = useCallback(() => {
    if (value === null || value === "") return "";
    if (type === "currency") return String(value);
    return String(value); // date stays as ISO string
  }, [value, type]);

  useEffect(() => {
    if (editing) {
      setDraft(rawValue());
      // Small delay to ensure the input is mounted
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing, rawValue]);

  function commitSave() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === "") {
      // Clear the field
      if (value !== null && value !== "") {
        onSave(null);
      }
      return;
    }
    // Only save if value actually changed
    const currentRaw = rawValue();
    if (trimmed !== currentRaw) {
      onSave(trimmed);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditing(false);
    }
  }

  const displayValue = formatDisplay(value, type);

  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {editing ? (
          <Input
            ref={inputRef}
            type={type === "currency" ? "number" : "date"}
            step={type === "currency" ? "0.01" : undefined}
            min={type === "currency" ? "0" : undefined}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitSave}
            onKeyDown={handleKeyDown}
            className="mt-0.5 h-7 w-full max-w-[200px] px-1.5 text-sm"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
              "-ml-1.5 rounded-md px-1.5 py-0.5 text-sm font-medium transition-colors hover:bg-muted",
              !displayValue && "font-normal text-muted-foreground"
            )}
          >
            {displayValue ?? placeholder}
          </button>
        )}
      </div>
    </div>
  );
}
