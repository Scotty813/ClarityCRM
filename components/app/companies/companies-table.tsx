"use client";

import { useState } from "react";
import { Building2, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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
import { CreateCompanyDialog } from "./create-company-dialog";
import { CompanyDetailDialog } from "./company-detail-dialog";
import type { Company } from "@/lib/types/database";

interface CompaniesTableProps {
  companies: Company[];
}

export function CompaniesTable({ companies }: CompaniesTableProps) {
  const { can } = usePermissions();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const query = search.toLowerCase();
  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(query) ||
    c.industry?.toLowerCase().includes(query)
  );

  async function handleDelete(e: React.MouseEvent, company: Company) {
    e.stopPropagation();
    if (!confirm(`Delete "${company.name}"? This cannot be undone.`)) return;

    const result = await deleteCompany(company.id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Company deleted");
      if (selectedCompany?.id === company.id) setSelectedCompany(null);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
            <p className="text-sm text-muted-foreground">
              {companies.length} {companies.length === 1 ? "company" : "companies"}
            </p>
          </div>
          {can("company:create") && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Add Company
            </Button>
          )}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <Building2 className="mb-3 size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {companies.length === 0
                ? "No companies yet. Add your first company to get started."
                : "No companies match your search"}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((company) => (
                  <TableRow
                    key={company.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedCompany(company);
                      setDetailOpen(true);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                          <Building2 className="size-4" />
                        </div>
                        <span className="font-medium">{company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {company.industry ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {company.phone ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(company.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
                                setEditingCompany(company);
                                setEditOpen(true);
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
        )}
      </div>

      <CreateCompanyDialog open={createOpen} onOpenChange={setCreateOpen} />

      <CompanyDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        company={selectedCompany}
      />

      <CompanyDetailDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        company={editingCompany}
        defaultEditing
      />
    </>
  );
}
