import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/lib/supabase/active-org";
import { DealHeader } from "@/components/app/deals/deal-header";
import { DealInfoCard } from "@/components/app/deals/deal-info-card";
import { DealStageProgress } from "@/components/app/deals/deal-stage-progress";
import { DealTimeline } from "@/components/app/deals/deal-timeline";
import { DealActivityComposer } from "@/components/app/deals/deal-activity-composer";
import { DealTasks } from "@/components/app/deals/deal-tasks";
import type {
  DealWithRelations,
  DealActivityWithAuthor,
  DealTask,
} from "@/lib/types/database";

interface DealPageProps {
  params: Promise<{ id: string }>;
}

export default async function DealPage({ params }: DealPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { orgId } = await getActiveOrganization();

  const [
    { data: deal },
    { data: activities },
    { data: tasks },
    { data: contacts },
    { data: companies },
    { data: members },
  ] = await Promise.all([
    supabase
      .from("deals")
      .select(
        "*, contacts(first_name, last_name), companies(name), owner:profiles!deals_owner_id_fkey(full_name, avatar_url)"
      )
      .eq("id", id)
      .eq("organization_id", orgId)
      .single(),
    supabase
      .from("deal_activities")
      .select("*, profiles(full_name)")
      .eq("deal_id", id)
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("deal_tasks")
      .select("*")
      .eq("deal_id", id)
      .eq("organization_id", orgId)
      .order("created_at", { ascending: true }),
    supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .eq("organization_id", orgId)
      .order("last_name", { ascending: true }),
    supabase
      .from("companies")
      .select("id, name")
      .eq("organization_id", orgId)
      .order("name", { ascending: true }),
    supabase
      .from("organization_users")
      .select("user_id, profiles(full_name)")
      .eq("organization_id", orgId),
  ]);

  if (!deal) notFound();

  const contact = deal.contacts as unknown as {
    first_name: string;
    last_name: string;
  } | null;
  const company = deal.companies as unknown as { name: string } | null;
  const owner = deal.owner as unknown as {
    full_name: string | null;
    avatar_url: string | null;
  } | null;

  const enrichedDeal: DealWithRelations = {
    ...deal,
    contact_name: contact
      ? `${contact.first_name} ${contact.last_name}`
      : null,
    company_name: company?.name ?? null,
    owner_name: owner?.full_name ?? null,
    owner_avatar_url: owner?.avatar_url ?? null,
    last_activity_at:
      activities && activities.length > 0 ? activities[0].created_at : null,
    next_task_title: null,
    next_task_due_date: null,
  };

  const enrichedActivities: DealActivityWithAuthor[] = (activities ?? []).map(
    (a) => {
      const profile = a.profiles as unknown as {
        full_name: string | null;
      } | null;
      return {
        ...a,
        author_name: profile?.full_name ?? null,
      };
    }
  );

  const memberOptions = (members ?? []).map((m) => {
    const profile = m.profiles as unknown as { full_name: string | null };
    return {
      id: m.user_id,
      name: profile?.full_name ?? "Unknown",
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <DealHeader
        deal={enrichedDeal}
        contacts={
          contacts?.map((c) => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`,
          })) ?? []
        }
        companies={companies ?? []}
        members={memberOptions}
      />

      <DealStageProgress deal={enrichedDeal} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <DealInfoCard deal={enrichedDeal} />
          <DealTasks tasks={(tasks ?? []) as DealTask[]} dealId={id} />
        </div>

        <div className="space-y-6">
          <DealActivityComposer dealId={id} />
          <DealTimeline activities={enrichedActivities} />
        </div>
      </div>
    </div>
  );
}
