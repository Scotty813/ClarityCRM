"use client";

import { FileText } from "lucide-react";
import { ACTIVITY_TYPE_LABELS, ACTIVITY_ICONS } from "@/lib/deals";
import type { DealActivityWithAuthor } from "@/lib/types/database";

interface CompanyActivityTabProps {
  activities: DealActivityWithAuthor[];
}

export function CompanyActivityTab({ activities }: CompanyActivityTabProps) {
  if (activities.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <FileText className="mx-auto mb-3 size-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No activity yet. Activity from deals will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-6 py-4">
      {activities.map((activity) => {
        const Icon = ACTIVITY_ICONS[activity.activity_type] ?? FileText;
        return (
          <div key={activity.id} className="flex gap-3">
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="size-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {ACTIVITY_TYPE_LABELS[activity.activity_type]}
              </p>
              {activity.content && (
                <p className="whitespace-pre-wrap text-sm">
                  {activity.content}
                </p>
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
          </div>
        );
      })}
    </div>
  );
}
