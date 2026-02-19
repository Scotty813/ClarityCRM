"use client";

import { Building2, Calendar, DollarSign, User, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DealWithRelations } from "@/lib/types/database";

interface DealInfoCardProps {
  deal: DealWithRelations;
}

export function DealInfoCard({ deal }: DealInfoCardProps) {
  const fields = [
    {
      icon: DollarSign,
      label: "Value",
      value:
        deal.value !== null
          ? `$${Number(deal.value).toLocaleString()}`
          : null,
    },
    {
      icon: Calendar,
      label: "Expected Close",
      value: deal.expected_close_date
        ? new Date(deal.expected_close_date + "T00:00:00").toLocaleDateString(
            "en-US",
            { month: "long", day: "numeric", year: "numeric" }
          )
        : null,
    },
    {
      icon: Users,
      label: "Owner",
      value: deal.owner_name,
    },
    {
      icon: User,
      label: "Contact",
      value: deal.contact_name,
    },
    {
      icon: Building2,
      label: "Company",
      value: deal.company_name,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Deal Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-medium">
                {value ?? <span className="text-muted-foreground">&mdash;</span>}
              </p>
            </div>
          </div>
        ))}
        {deal.notes && (
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{deal.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
