import { getDashboardData, getGettingStartedData } from "@/lib/actions/dashboard";
import { getPipelineChartData, getStaleDealData } from "@/lib/dashboard";
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist";
import type { ChecklistItem } from "@/components/onboarding/onboarding-checklist";
import { DashboardKPIs } from "@/components/app/dashboard/dashboard-kpis";
import { DashboardEmptyState } from "@/components/app/dashboard/dashboard-empty-state";
import { ActivityFeed } from "@/components/app/dashboard/activity-feed";
import { TasksAlerts } from "@/components/app/dashboard/tasks-alerts";
import { PipelineChart } from "@/components/app/dashboard/pipeline-chart";
import { DashboardGreeting } from "@/components/app/dashboard/dashboard-greeting";

export default async function DashboardPage() {
  const [data, gettingStarted] = await Promise.all([
    getDashboardData(),
    getGettingStartedData(),
  ]);

  const hasDeals = data.deals.length > 0;
  const firstName = data.userName?.split(" ")[0] ?? null;
  const pipelineData = getPipelineChartData(data.deals);
  const staleDealData = getStaleDealData(data.deals, data.activities);

  const checklistItems: ChecklistItem[] = [
    { id: "account", label: "Create account", done: true },
    { id: "contact", label: "Add first contact", done: gettingStarted.hasContacts, href: "/contacts" },
    { id: "pipeline", label: "Create pipeline", done: gettingStarted.hasDeals, href: "/deals" },
    { id: "invite", label: "Invite teammate", done: gettingStarted.hasTeammates, href: "/settings/team" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="flex flex-col gap-8">
          {/* Greeting */}
          <DashboardGreeting firstName={firstName} />

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
          <OnboardingChecklist items={checklistItems} dismissed={gettingStarted.dismissed} />
        </div>
      </div>
    </div>
  );
}
