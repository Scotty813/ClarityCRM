import { notFound } from "next/navigation";
import {
  Globe,
  Factory,
  Phone,
  Users,
  MapPin,
  Briefcase,
  DollarSign,
  User,
  StickyNote,
  Tag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCompanyDetail } from "@/lib/actions/company-detail";
import { CompanyHeader } from "@/components/app/companies/company-header";
import { CompanyLifecycleProgress } from "@/components/app/companies/company-lifecycle-progress";
import { CompanyPeopleTab } from "@/components/app/companies/company-people-tab";
import { CompanyDealsTab } from "@/components/app/companies/company-deals-tab";
import { CompanyActivityTab } from "@/components/app/companies/company-activity-tab";
import { TAG_COLOR_CLASSES, type TagColor } from "@/lib/companies";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CompanyPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id } = await params;
  const result = await getCompanyDetail(id);

  if (!result.success) notFound();

  const { company, contacts, deals, activities, members } = result;

  const address = [
    company.address_line1,
    company.address_line2,
    [company.city, company.state].filter(Boolean).join(", "),
    company.postal_code,
    company.country,
  ]
    .filter(Boolean)
    .join("\n");

  const fields = [
    { icon: Globe, label: "Website", value: company.domain },
    { icon: Factory, label: "Industry", value: company.industry },
    { icon: Phone, label: "Phone", value: company.phone },
    { icon: User, label: "Owner", value: company.owner_name },
    { icon: MapPin, label: "Address", value: address || null },
    {
      icon: DollarSign,
      label: "Pipeline Value",
      value:
        company.pipeline_value > 0
          ? formatCurrency(company.pipeline_value)
          : null,
    },
    {
      icon: Briefcase,
      label: "Open Deals",
      value:
        company.open_deals_count > 0
          ? String(company.open_deals_count)
          : null,
    },
    {
      icon: Users,
      label: "Contacts",
      value: company.contact_count > 0 ? String(company.contact_count) : null,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <CompanyHeader company={company} members={members} />
      <CompanyLifecycleProgress company={company} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          {/* Company Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    {value ? (
                      <p className="whitespace-pre-line text-sm font-medium">
                        {value}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">&mdash;</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Tags */}
              <div className="flex items-start gap-3">
                <Tag className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Tags</p>
                  {company.tags.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {company.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            TAG_COLOR_CLASSES[tag.color as TagColor] ??
                              TAG_COLOR_CLASSES.gray
                          )}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">&mdash;</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {company.notes && (
                <div className="flex items-start gap-3">
                  <StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {company.notes}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* People */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                People
                {contacts.length > 0 && (
                  <span className="ml-1.5 text-muted-foreground">
                    ({contacts.length})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CompanyPeopleTab contacts={contacts} companyId={id} />
            </CardContent>
          </Card>

          {/* Deals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Deals
                {deals.length > 0 && (
                  <span className="ml-1.5 text-muted-foreground">
                    ({deals.length})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CompanyDealsTab deals={deals} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CompanyActivityTab activities={activities} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
