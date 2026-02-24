import { getDashboardData } from "@/lib/actions/dashboard";
import { getPipelineChartData, getStaleDealData } from "@/lib/dashboard";
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist";
import { DashboardKPIs } from "@/components/app/dashboard/dashboard-kpis";
import { DashboardEmptyState } from "@/components/app/dashboard/dashboard-empty-state";
import { ActivityFeed } from "@/components/app/dashboard/activity-feed";
import { TasksAlerts } from "@/components/app/dashboard/tasks-alerts";
import { PipelineChart } from "@/components/app/dashboard/pipeline-chart";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const hasDeals = data.deals.length > 0;

  const firstName = data.userName?.split(" ")[0] ?? null;
  const greeting = getGreeting();

  const pipelineData = getPipelineChartData(data.deals);
  const staleDealData = getStaleDealData(data.deals, data.activities);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="flex flex-col gap-8">
          {/* Greeting */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {greeting}
              {firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here&apos;s what&apos;s happening today.
            </p>
          </div>

          {hasDeals ? (
            <>
              <DashboardKPIs kpis={data.kpis} />
              <PipelineChart data={pipelineData} />
              <div className="grid gap-8 md:grid-cols-2">
                <ActivityFeed activities={data.activities} />
                <TasksAlerts
                  tasks={data.tasks}
                  staleDealData={staleDealData}
                />
              </div>
            </>
          ) : (
            <DashboardEmptyState />
          )}
        </div>

        {/* Sidebar */}
        <div>
          <OnboardingChecklist />
        </div>
      </div>
    </div>
  );
}
