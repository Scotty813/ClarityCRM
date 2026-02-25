"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { deleteCompany } from "@/lib/actions/companies";
import { EditCompanyDialog } from "./edit-company-dialog";
import type { CompanyWithRelations } from "@/lib/types/database";

interface SelectOption {
  id: string;
  name: string;
}

interface CompanyHeaderProps {
  company: CompanyWithRelations;
  members: SelectOption[];
}

export function CompanyHeader({ company, members }: CompanyHeaderProps) {
  const router = useRouter();
  const { can } = usePermissions();
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${company.name}"? This cannot be undone.`)) return;

    const result = await deleteCompany(company.id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Company deleted");
      router.push("/companies");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/companies")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {company.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {can("company:edit") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="mr-1.5 size-3.5" />
              Edit
            </Button>
          )}
          {can("company:delete") && (
            <Button variant="outline" size="sm" onClick={handleDelete} className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="mr-1.5 size-3.5" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <EditCompanyDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        company={company}
        members={members}
      />
    </>
  );
}
