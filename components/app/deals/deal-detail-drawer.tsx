"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
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
import { InlineEditField } from "@/components/app/shared/inline-edit-field";
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
import { DEAL_STAGES, STAGE_LABELS, STAGE_BADGE_COLORS } from "@/lib/deals";
import { can } from "@/lib/permissions";
import { getDealDetail, getDealFieldOptions } from "@/lib/actions/deal-detail";
import {
  updateDealStage,
  updateDealField,
  updateDealContact,
} from "@/lib/actions/deals";
import { cn } from "@/lib/utils";
import { DealActivityComposer } from "./deal-activity-composer";
import { DealActivityList } from "./deal-activity-list";
import { DealTimeline } from "./deal-timeline";
import { DealTasks } from "./deal-tasks";
import { CloseDealDialog } from "./close-deal-dialog";
import { EntityPicker } from "@/components/app/shared/entity-picker";
import type {
  DealWithRelations,
  DealActivityWithAuthor,
  DealTask,
  DealStage,
  SelectOption,
  DealEntityField,
  ContactSelectOption,
  DealUpdatableField,
} from "@/lib/types/database";

interface DealDetailDrawerProps {
  dealId: string | null;
  onClose: () => void;
}

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
        {dealId && <DrawerContent dealId={dealId} />}
      </SheetContent>
    </Sheet>
  );
}

function DrawerContent({ dealId }: { dealId: string }) {
  const [deal, setDeal] = useState<DealWithRelations | null>(null);
  const [activities, setActivities] = useState<DealActivityWithAuthor[]>([]);
  const [tasks, setTasks] = useState<DealTask[]>([]);
  const [contactEmail, setContactEmail] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [closeDealVariant, setCloseDealVariant] = useState<"won" | "lost">(
    "won"
  );
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [fieldOptions, setFieldOptions] = useState<{
    contacts: ContactSelectOption[];
    members: SelectOption[];
  } | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const fetchDetail = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const result = await getDealDetail(dealId);
        if (result.success) {
          setDeal(result.deal);
          setActivities(result.activities);
          setTasks(result.tasks);
          setContactEmail(result.contactEmail);
          setCurrentUserId(result.currentUserId);
          setIsAdmin(can(result.currentUserRole, "deal:delete"));
        } else {
          toast.error(result.error);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [dealId]
  );

  const handleMutationSuccess = useCallback(() => {
    fetchDetail(true);
  }, [fetchDetail]);

  const loadOptions = useCallback(async () => {
    if (fieldOptions || optionsLoading) return;
    setOptionsLoading(true);
    try {
      const result = await getDealFieldOptions();
      if (result.success) {
        setFieldOptions({
          contacts: result.contacts,
          members: result.members,
        });
      }
    } finally {
      setOptionsLoading(false);
    }
  }, [fieldOptions, optionsLoading]);

  const handleFieldUpdate = useCallback(
    async (
      field: DealEntityField,
      option: SelectOption | null,
      nameKey: "owner_name" | "contact_name" | "company_name"
    ) => {
      if (!deal) return;
      const prev = { ...deal };
      setDeal({
        ...deal,
        [field]: option?.id ?? null,
        [nameKey]: option?.name ?? null,
      });
      const result = await updateDealField(deal.id, field, option?.id ?? null);
      if (!result.success) {
        setDeal(prev);
        toast.error(result.error ?? "Failed to update field");
      } else {
        fetchDetail(true);
      }
    },
    [deal, fetchDetail]
  );

  const handleScalarUpdate = useCallback(
    async (field: DealUpdatableField, rawValue: string | null) => {
      if (!deal) return;
      const prev = { ...deal };
      // Optimistic update
      if (field === "value") {
        setDeal({
          ...deal,
          value: rawValue !== null ? parseFloat(rawValue) : null,
        });
      } else if (field === "expected_close_date") {
        setDeal({ ...deal, expected_close_date: rawValue });
      }
      const result = await updateDealField(deal.id, field, rawValue);
      if (!result.success) {
        setDeal(prev);
        toast.error(result.error ?? "Failed to update field");
      } else {
        fetchDetail(true);
      }
    },
    [deal, fetchDetail]
  );

  const handleContactUpdate = useCallback(
    async (option: ContactSelectOption | null) => {
      if (!deal) return;
      const prev = { ...deal };
      // Optimistic update — cascade contact + company
      setDeal({
        ...deal,
        contact_id: option?.id ?? null,
        contact_name: option?.name ?? null,
        company_id: option?.company_id ?? null,
        company_name: option?.company_name ?? null,
      });
      const result = await updateDealContact(
        deal.id,
        option?.id ?? null,
        option?.company_id ?? null
      );
      if (!result.success) {
        setDeal(prev);
        toast.error(result.error ?? "Failed to update contact");
      } else {
        fetchDetail(true);
      }
    },
    [deal, fetchDetail]
  );

  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      fetchDetail();
    } else {
      setActiveTab("overview");
      fetchDetail(true);
    }
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
      fetchDetail(true);
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

  return (
    <>
      {/* Sticky header */}
      <SheetHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <SheetTitle className="truncate text-lg">
            <Link href={`/deals/${deal.id}`} className="hover:underline">
              {deal.name}
            </Link>
          </SheetTitle>
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
            <SelectContent position="popper">
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
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-6 py-4">
              <div className="space-y-4">
                <InlineEditField
                  icon={DollarSign}
                  label="Value"
                  value={deal.value}
                  placeholder="Add deal value"
                  type="currency"
                  onSave={(val) => handleScalarUpdate("value", val)}
                />
                <InlineEditField
                  icon={Calendar}
                  label="Expected Close"
                  value={deal.expected_close_date}
                  placeholder="Add close date"
                  type="date"
                  onSave={(val) =>
                    handleScalarUpdate("expected_close_date", val)
                  }
                />
                <EntityPicker
                  icon={Users}
                  label="Owner"
                  value={deal.owner_name}
                  placeholder="Add owner..."
                  options={fieldOptions?.members ?? []}
                  loading={optionsLoading}
                  onOpen={loadOptions}
                  onSelect={(opt) =>
                    handleFieldUpdate("owner_id", opt, "owner_name")
                  }
                />
                <EntityPicker
                  icon={User}
                  label="Contact"
                  value={deal.contact_name}
                  placeholder="Add contact..."
                  options={
                    deal.company_id
                      ? (fieldOptions?.contacts ?? []).filter(
                          (c) => c.company_id === deal.company_id
                        )
                      : fieldOptions?.contacts ?? []
                  }
                  loading={optionsLoading}
                  onOpen={loadOptions}
                  onSelect={(opt) =>
                    handleContactUpdate(opt as ContactSelectOption | null)
                  }
                />
                <div className="flex items-center gap-3">
                  <Building2 className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm font-medium">
                      {deal.company_name ?? (
                        <span className="text-muted-foreground">&mdash;</span>
                      )}
                    </p>
                  </div>
                </div>
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
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="activity" className="mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-6 px-6 py-4">
              <DealActivityComposer
                dealId={deal.id}
                onMutationSuccess={handleMutationSuccess}
              />
              <DealActivityList
                activities={activities.filter(
                  (a) => a.activity_type !== "stage_change"
                )}
                dealId={deal.id}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onMutationSuccess={handleMutationSuccess}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="tasks"
          className="mt-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
        >
          <DealTasks
            tasks={tasks}
            dealId={deal.id}
            onMutationSuccess={handleMutationSuccess}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-6 py-4">
              <DealTimeline activities={activities} />
            </div>
          </ScrollArea>
        </TabsContent>
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
