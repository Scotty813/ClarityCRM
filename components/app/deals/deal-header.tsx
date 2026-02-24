"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { deleteDeal } from "@/lib/actions/deals";
import { EditDealDialog } from "./edit-deal-dialog";
import type { DealWithRelations } from "@/lib/types/database";

interface SelectOption {
  id: string;
  name: string;
  company_id?: string | null;
}

interface DealHeaderProps {
  deal: DealWithRelations;
  contacts: SelectOption[];
  companies: SelectOption[];
  members: SelectOption[];
}

export function DealHeader({
  deal,
  contacts,
  companies,
  members,
}: DealHeaderProps) {
  const router = useRouter();
  const { can } = usePermissions();
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${deal.name}"? This cannot be undone.`)) return;

    const result = await deleteDeal(deal.id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Deal deleted");
      router.push("/deals");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/deals")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {deal.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {can("deal:edit") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="mr-1.5 size-3.5" />
              Edit
            </Button>
          )}
          {can("deal:delete") && (
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-1.5 size-3.5" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <EditDealDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        deal={deal}
        contacts={contacts}
        companies={companies}
        members={members}
      />
    </>
  );
}
