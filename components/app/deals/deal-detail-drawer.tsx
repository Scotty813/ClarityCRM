"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  ListTodo,
  Mail,
  ArrowRightLeft,
  Building2,
  Calendar,
  DollarSign,
  User,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DEAL_STAGES, STAGE_LABELS } from "@/lib/deals";
import { formatCurrency } from "@/lib/format";
import { getDealDetail } from "@/lib/actions/deal-detail";
import { updateDealStage } from "@/lib/actions/deals";
import { cn } from "@/lib/utils";
import { DealActivityComposer } from "./deal-activity-composer";
import { DealTimeline } from "./deal-timeline";
import { DealTasks } from "./deal-tasks";
import { CloseDealDialog } from "./close-deal-dialog";
import type {
  DealWithRelations,
  DealActivityWithAuthor,
  DealTask,
  DealStage,
} from "@/lib/types/database";

interface DealDetailDrawerProps {
  dealId: string | null;
  onClose: () => void;
}

const STAGE_BADGE_COLORS: Record<DealStage, string> = {
  qualified: "",
  proposal: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  negotiation: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  won: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  lost: "bg-destructive/10 text-destructive",
};

export function DealDetailDrawer({ dealId, onClose }: DealDetailDrawerProps) {
  return (
    <Sheet
      open={!!dealId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        {dealId && <DrawerContent key={dealId} dealId={dealId} />}
      </SheetContent>
    </Sheet>
  );
}

function DrawerContent({ dealId }: { dealId: string }) {
  const [deal, setDeal] = useState<DealWithRelations | null>(null);
  const [activities, setActivities] = useState<DealActivityWithAuthor[]>([]);
  const [tasks, setTasks] = useState<DealTask[]>([]);
  const [contactEmail, setContactEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [closeDealVariant, setCloseDealVariant] = useState<"won" | "lost">(
    "won"
  );
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDealDetail(dealId);
      if (result.success) {
        setDeal(result.deal);
        setActivities(result.activities);
        setTasks(result.tasks);
        setContactEmail(result.contactEmail);
      } else {
        toast.error(result.error);
      }
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  async function handleMoveStage(newStage: string) {
    if (!deal || deal.stage === newStage) return;

    const stage = newStage as DealStage;
    if (stage === "won" || stage === "lost") {
      setCloseDealVariant(stage);
      setCloseDialogOpen(true);
      return;
    }

    const result = await updateDealStage(deal.id, stage);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success(`Moved to ${STAGE_LABELS[stage]}`);
      fetchDetail();
    }
  }

  if (loading || !deal) {
    return (
      <>
        <SheetHeader className="sr-only">
          <SheetTitle>Deal details</SheetTitle>
          <SheetDescription>Loading deal information</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  const infoFields = [
    {
      icon: DollarSign,
      label: "Value",
      value:
        deal.value !== null ? formatCurrency(Number(deal.value)) : null,
    },
    {
      icon: Calendar,
      label: "Expected Close",
      value: deal.expected_close_date
        ? new Date(
            deal.expected_close_date + "T00:00:00"
          ).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : null,
    },
    { icon: Users, label: "Owner", value: deal.owner_name },
    { icon: User, label: "Contact", value: deal.contact_name },
    { icon: Building2, label: "Company", value: deal.company_name },
  ];

  return (
    <>
      {/* Sticky header */}
      <SheetHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <SheetTitle className="truncate text-lg">{deal.name}</SheetTitle>
          <Badge
            variant="secondary"
            className={cn(
              "shrink-0 text-xs",
              STAGE_BADGE_COLORS[deal.stage]
            )}
          >
            {STAGE_LABELS[deal.stage]}
          </Badge>
        </div>
        <SheetDescription className="sr-only">
          Deal details for {deal.name}
        </SheetDescription>
      </SheetHeader>

      {/* Action bar */}
      <div className="flex items-center gap-2 border-b px-6 py-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveTab("activity")}
        >
          <FileText className="mr-1.5 size-3.5" />
          Log note
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveTab("tasks")}
        >
          <ListTodo className="mr-1.5 size-3.5" />
          Add task
        </Button>
        {contactEmail && (
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${contactEmail}`}>
              <Mail className="mr-1.5 size-3.5" />
              Email
            </a>
          </Button>
        )}
        <div className="ml-auto">
          <Select value={deal.stage} onValueChange={handleMoveStage}>
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <ArrowRightLeft className="mr-1.5 size-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEAL_STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STAGE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scrollable tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="mx-6 mt-3 w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4">
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-4">
                {infoFields.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium">
                        {value ?? (
                          <span className="text-muted-foreground">
                            &mdash;
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                {deal.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm">
                        {deal.notes}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-0 space-y-6">
              <DealActivityComposer dealId={deal.id} />
              <DealTimeline activities={activities} />
            </TabsContent>

            <TabsContent value="tasks" className="mt-0">
              <DealTasks tasks={tasks} dealId={deal.id} />
            </TabsContent>

            <TabsContent value="contacts" className="mt-0">
              <div className="space-y-4">
                {deal.contact_name && (
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p className="text-sm font-medium">{deal.contact_name}</p>
                    {contactEmail && (
                      <a
                        href={`mailto:${contactEmail}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {contactEmail}
                      </a>
                    )}
                  </div>
                )}
                {deal.company_name && (
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm font-medium">{deal.company_name}</p>
                  </div>
                )}
                {!deal.contact_name && !deal.company_name && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No contacts or companies linked to this deal.
                  </p>
                )}
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      <CloseDealDialog
        open={closeDialogOpen}
        onOpenChange={(open) => {
          setCloseDialogOpen(open);
          if (!open) fetchDetail();
        }}
        dealId={dealId}
        variant={closeDealVariant}
      />
    </>
  );
}
