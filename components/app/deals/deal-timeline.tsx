"use client";

import {
  ArrowRight,
  FileText,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STAGE_LABELS, ACTIVITY_TYPE_LABELS } from "@/lib/deals";
import { cn } from "@/lib/utils";
import type { DealActivityWithAuthor, DealStage } from "@/lib/types/database";

interface DealTimelineProps {
  activities: DealActivityWithAuthor[];
}

const ACTIVITY_ICONS: Record<string, typeof FileText> = {
  note: FileText,
  call: Phone,
  email: Mail,
  meeting: Users,
  stage_change: ArrowRight,
};

const STAGE_BADGE_COLORS: Record<DealStage, string> = {
  qualified: "",
  proposal: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  negotiation: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  won: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  lost: "bg-destructive/10 text-destructive",
};

export function DealTimeline({ activities }: DealTimelineProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No activity yet. Log a note, call, or meeting to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.activity_type] ?? FileText;
            const isStageChange = activity.activity_type === "stage_change";
            const metadata = activity.metadata as {
              from_stage?: DealStage;
              to_stage?: DealStage;
            } | null;

            return (
              <div key={activity.id} className="flex gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="size-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  {isStageChange && metadata?.from_stage && metadata?.to_stage ? (
                    <div className="flex flex-wrap items-center gap-1.5 text-sm">
                      <span className="text-muted-foreground">Moved from</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          STAGE_BADGE_COLORS[metadata.from_stage]
                        )}
                      >
                        {STAGE_LABELS[metadata.from_stage]}
                      </Badge>
                      <ArrowRight className="size-3 text-muted-foreground" />
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          STAGE_BADGE_COLORS[metadata.to_stage]
                        )}
                      >
                        {STAGE_LABELS[metadata.to_stage]}
                      </Badge>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-medium text-muted-foreground">
                        {ACTIVITY_TYPE_LABELS[activity.activity_type]}
                      </p>
                      {activity.content && (
                        <p className="whitespace-pre-wrap text-sm">
                          {activity.content}
                        </p>
                      )}
                    </>
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
      </CardContent>
    </Card>
  );
}
