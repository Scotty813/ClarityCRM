import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ACTIVITY_ICONS, ACTIVITY_TYPE_LABELS } from "@/lib/deals";
import { formatRelativeTime } from "@/lib/format";
import type { DashboardActivity } from "@/lib/dashboard";

export function ActivityFeed({
  activities,
}: {
  activities: DashboardActivity[];
}) {
  const items = activities.slice(0, 8);

  if (items.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No activity yet. Activity will appear here as you work on deals.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map((activity) => {
          const Icon = ACTIVITY_ICONS[activity.activity_type];
          const label = ACTIVITY_TYPE_LABELS[activity.activity_type];

          return (
            <Link
              key={activity.id}
              href={`/deals/${activity.deal_id}`}
              className="group flex items-start gap-3"
            >
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                {Icon && <Icon className="size-3.5 text-muted-foreground" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium group-hover:underline">
                    {label}
                  </span>
                  {activity.deal_name && (
                    <span className="truncate text-xs text-muted-foreground">
                      {activity.deal_name}
                    </span>
                  )}
                </div>
                {activity.content && (
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {activity.content}
                  </p>
                )}
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  {activity.author_name && (
                    <span>{activity.author_name}</span>
                  )}
                  <span>{formatRelativeTime(activity.created_at)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
