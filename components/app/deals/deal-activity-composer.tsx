"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createDealActivity } from "@/lib/actions/deal-activities";
import type { DealActivityType } from "@/lib/types/database";

interface DealActivityComposerProps {
  dealId: string;
  onMutationSuccess?: () => void;
}

const ACTIVITY_TABS: { value: DealActivityType; label: string }[] = [
  { value: "note", label: "Note" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
];

export function DealActivityComposer({
  dealId,
  onMutationSuccess,
}: DealActivityComposerProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<DealActivityType>("note");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const result = await createDealActivity(dealId, type, content);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Activity logged");
      setContent("");
      onMutationSuccess?.();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Log Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Tabs
            value={type}
            onValueChange={(v) => setType(v as DealActivityType)}
          >
            <TabsList className="w-full">
              {ACTIVITY_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {ACTIVITY_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <Textarea
                  placeholder={`Log a ${tab.label.toLowerCase()}...`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                />
              </TabsContent>
            ))}
          </Tabs>
          <Button type="submit" size="sm" disabled={loading || !content.trim()}>
            {loading ? "Saving..." : "Log Activity"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
