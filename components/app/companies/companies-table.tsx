"use client";

import Link from "next/link";
import { Building2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { deleteCompany } from "@/lib/actions/companies";
import { LIFECYCLE_LABELS, LIFECYCLE_BADGE_COLORS } from "@/lib/companies";
import { TAG_COLOR_CLASSES, type TagColor } from "@/lib/companies";
import { formatRelativeTime, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CompanyWithRelations } from "@/lib/types/database";

interface CompaniesTableProps {
  companies: CompanyWithRelations[];
  onCompanySelect: (companyId: string) => void;
}

export function CompaniesTable({
  companies,
  onCompanySelect,
}: CompaniesTableProps) {
  const { can } = usePermissions();

  async function handleDelete(
    e: React.MouseEvent,
    company: CompanyWithRelations
  ) {
    e.stopPropagation();
    if (!confirm(`Delete "${company.name}"? This cannot be undone.`)) return;

    const result = await deleteCompany(company.id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Company deleted");
    }
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <Building2 className="mb-3 size-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No companies match your filters
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Lifecycle</TableHead>
            <TableHead className="text-right">Open Deals</TableHead>
            <TableHead className="text-right">Pipeline Value</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow
              key={company.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onCompanySelect(company.id)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <Building2 className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/companies/${company.id}`}
                      className="truncate font-medium hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {company.name}
                    </Link>
                    {(company.domain || company.industry) && (
                      <p className="truncate text-xs text-muted-foreground">
                        {[company.domain, company.industry]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {company.owner_name ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarImage
                        src={company.owner_avatar_url ?? undefined}
                      />
                      <AvatarFallback className="text-[10px]">
                        {company.owner_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{company.owner_name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">&mdash;</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    LIFECYCLE_BADGE_COLORS[company.lifecycle_stage]
                  )}
                >
                  {LIFECYCLE_LABELS[company.lifecycle_stage]}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {company.open_deals_count > 0 ? (
                  company.open_deals_count
                ) : (
                  <span className="text-muted-foreground">&mdash;</span>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {company.pipeline_value > 0 ? (
                  formatCurrency(company.pipeline_value)
                ) : (
                  <span className="text-muted-foreground">&mdash;</span>
                )}
              </TableCell>
              <TableCell>
                <span
                  className="text-sm text-muted-foreground"
                  title={
                    company.last_activity_at
                      ? new Date(company.last_activity_at).toLocaleString()
                      : undefined
                  }
                >
                  {formatRelativeTime(company.last_activity_at)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {company.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className={cn(
                        "px-1.5 py-0 text-[10px]",
                        TAG_COLOR_CLASSES[tag.color as TagColor] ??
                          TAG_COLOR_CLASSES.gray
                      )}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {company.tags.length > 2 && (
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 text-[10px]"
                    >
                      +{company.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {can("company:edit") && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompanySelect(company.id);
                        }}
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {can("company:delete") && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => handleDelete(e, company)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
