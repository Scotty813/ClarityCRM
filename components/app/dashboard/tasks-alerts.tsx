"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS, STAGE_BADGE_COLORS } from "@/lib/deals";
import { formatRelativeTime } from "@/lib/format";
import type { DashboardTask, StaleDeal } from "@/lib/dashboard";
import type { DealStage } from "@/lib/types/database";

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "No date";
  const date = new Date(dueDate);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TasksAlerts({
  tasks,
  staleDealData,
}: {
  tasks: DashboardTask[];
  staleDealData: StaleDeal[];
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-0">
        <CardTitle>Tasks & Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tasks">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="tasks" className="flex-1">
              Upcoming Tasks
              {tasks.length > 0 && (
                <Badge variant="secondary" className="ml-1.5">
                  {tasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="stale" className="flex-1">
              Needs Attention
              {staleDealData.length > 0 && (
                <Badge variant="secondary" className="ml-1.5">
                  {staleDealData.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-0">
            {tasks.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No upcoming tasks.
              </p>
            ) : (
              <div className="grid gap-3">
                {tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/deals/${task.deal_id}`}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium group-hover:underline">
                        {task.title}
                      </p>
                      {task.deal_name && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {task.deal_name}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {isOverdue(task.due_date) ? (
                        <Badge variant="destructive">
                          {formatDueDate(task.due_date)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {formatDueDate(task.due_date)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stale" className="mt-0">
            {staleDealData.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                All deals are up to date.
              </p>
            ) : (
              <div className="grid gap-3">
                {staleDealData.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium group-hover:underline">
                        {deal.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Last activity {formatRelativeTime(deal.lastActivityAt)}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={STAGE_BADGE_COLORS[deal.stage]}
                    >
                      {STAGE_LABELS[deal.stage]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
