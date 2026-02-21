"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LIFECYCLE_LABELS, LIFECYCLE_BADGE_COLORS } from "@/lib/companies";
import { getCompanyDetail } from "@/lib/actions/company-detail";
import { cn } from "@/lib/utils";
import { CompanyOverviewTab } from "./company-overview-tab";
import { CompanyPeopleTab } from "./company-people-tab";
import { CompanyDealsTab } from "./company-deals-tab";
import { CompanyActivityTab } from "./company-activity-tab";
import type {
  CompanyWithRelations,
  Contact,
  DealWithRelations,
  DealActivityWithAuthor,
  MemberRole,
  SelectOption,
} from "@/lib/types/database";

interface CompanyDetailDrawerProps {
  companyId: string | null;
  onClose: () => void;
}

export function CompanyDetailDrawer({
  companyId,
  onClose,
}: CompanyDetailDrawerProps) {
  return (
    <Sheet
      open={!!companyId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        {companyId && <DrawerContent companyId={companyId} />}
      </SheetContent>
    </Sheet>
  );
}

function DrawerContent({ companyId }: { companyId: string }) {
  const [company, setCompany] = useState<CompanyWithRelations | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<DealWithRelations[]>([]);
  const [activities, setActivities] = useState<DealActivityWithAuthor[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<MemberRole>("member");
  const [fieldOptions, setFieldOptions] = useState<{
    members: SelectOption[];
    tags: { id: string; name: string; color: string }[];
  }>({ members: [], tags: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchDetail = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const result = await getCompanyDetail(companyId);
        if (result.success) {
          setCompany(result.company);
          setContacts(result.contacts);
          setDeals(result.deals);
          setActivities(result.activities);
          setCurrentUserId(result.currentUserId);
          setCurrentUserRole(result.currentUserRole);
          setFieldOptions({ members: result.members, tags: result.allTags });
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [companyId]
  );

  const handleMutationSuccess = useCallback(() => {
    fetchDetail(true);
  }, [fetchDetail]);

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

  if (loading || !company) {
    return (
      <>
        <SheetHeader className="sr-only">
          <SheetTitle>Company details</SheetTitle>
          <SheetDescription>Loading company information</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <SheetHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <SheetTitle className="truncate text-lg">{company.name}</SheetTitle>
          <Badge
            variant="secondary"
            className={cn(
              "shrink-0 text-xs",
              LIFECYCLE_BADGE_COLORS[company.lifecycle_stage]
            )}
          >
            {LIFECYCLE_LABELS[company.lifecycle_stage]}
          </Badge>
        </div>
        <SheetDescription className="sr-only">
          Company details for {company.name}
        </SheetDescription>
      </SheetHeader>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="mx-6 mt-3 w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="people">
            People{contacts.length > 0 ? ` (${contacts.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="deals">
            Deals{deals.length > 0 ? ` (${deals.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <CompanyOverviewTab
              company={company}
              fieldOptions={fieldOptions}
              onMutationSuccess={handleMutationSuccess}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="people" className="mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <CompanyPeopleTab contacts={contacts} companyId={companyId} />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="deals" className="mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <CompanyDealsTab deals={deals} />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="activity" className="mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <CompanyActivityTab activities={activities} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </>
  );
}
