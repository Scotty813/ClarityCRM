"use client";

import { useState, useRef, useCallback } from "react";
import { FileText, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ACTIVITY_TYPE_LABELS, ACTIVITY_ICONS } from "@/lib/deals";
import { cn } from "@/lib/utils";
import {
  updateDealActivity,
  deleteDealActivity,
} from "@/lib/actions/deal-activities";
import type { DealActivityWithAuthor } from "@/lib/types/database";

interface DealActivityListProps {
  activities: DealActivityWithAuthor[];
  dealId: string;
  currentUserId: string;
  isAdmin: boolean;
  onMutationSuccess: () => void;
}

export function DealActivityList({
  activities,
  dealId,
  currentUserId,
  isAdmin,
  onMutationSuccess,
}: DealActivityListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [optimisticActivities, setOptimisticActivities] = useState<
    Map<string, string>
  >(new Map());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startEdit = useCallback(
    (activity: DealActivityWithAuthor) => {
      if (activity.created_by !== currentUserId && !isAdmin) return;
      setEditingId(activity.id);
      setEditContent(activity.content ?? "");
      // Focus textarea after render
      setTimeout(() => textareaRef.current?.focus(), 0);
    },
    [currentUserId, isAdmin]
  );

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditContent("");
  }, []);

  const saveEdit = useCallback(
    async (activityId: string) => {
      const trimmed = editContent.trim();
      setEditingId(null);

      // Optimistic update
      setOptimisticActivities((prev) => new Map(prev).set(activityId, trimmed));

      const result = await updateDealActivity(activityId, trimmed);
      if (!result.success) {
        // Revert optimistic update
        setOptimisticActivities((prev) => {
          const next = new Map(prev);
          next.delete(activityId);
          return next;
        });
        toast.error(result.error ?? "Failed to update activity");
      } else {
        setOptimisticActivities((prev) => {
          const next = new Map(prev);
          next.delete(activityId);
          return next;
        });
        onMutationSuccess();
      }
    },
    [editContent, onMutationSuccess]
  );

  const handleDelete = useCallback(
    async (activityId: string) => {
      const result = await deleteDealActivity(activityId, dealId);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete activity");
      } else {
        onMutationSuccess();
      }
    },
    [dealId, onMutationSuccess]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, activityId: string) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit();
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        saveEdit(activityId);
      }
    },
    [cancelEdit, saveEdit]
  );

  if (activities.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No activity yet. Log a note, call, or meeting to get started.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = ACTIVITY_ICONS[activity.activity_type] ?? FileText;
        const isEditing = editingId === activity.id;
        const canModify =
          activity.created_by === currentUserId || isAdmin;
        const displayContent =
          optimisticActivities.get(activity.id) ?? activity.content;

        return (
          <div
            key={activity.id}
            className="group flex gap-3"
          >
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="size-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {ACTIVITY_TYPE_LABELS[activity.activity_type]}
              </p>
              {isEditing ? (
                <Textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, activity.id)}
                  onBlur={() => saveEdit(activity.id)}
                  className="min-h-[60px] text-sm"
                  data-testid="activity-edit-textarea"
                />
              ) : (
                displayContent && (
                  <p
                    className={cn(
                      "whitespace-pre-wrap text-sm",
                      canModify &&
                        "cursor-pointer rounded px-1 -mx-1 hover:bg-muted/50 transition-colors"
                    )}
                    onClick={() => canModify && startEdit(activity)}
                    data-testid="activity-content"
                  >
                    {displayContent}
                  </p>
                )
              )}
              <p className="text-xs text-muted-foreground">
                {activity.author_name ?? "Unknown"} &middot;{" "}
                {new Date(activity.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {canModify && !isEditing && (
              <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      data-testid="activity-action-menu"
                    >
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(activity.id)}
                      data-testid="activity-delete"
                    >
                      <Trash2 className="mr-2 size-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
