"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateDeal } from "@/lib/actions/deals";
import { DealFormFields } from "./deal-form-fields";
import type { DealFormData, DealWithRelations } from "@/lib/types/database";

interface SelectOption {
  id: string;
  name: string;
}

interface EditDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: DealWithRelations;
  contacts: SelectOption[];
  companies: SelectOption[];
  members: SelectOption[];
}

export function EditDealDialog({
  open,
  onOpenChange,
  deal,
  contacts,
  companies,
  members,
}: EditDealDialogProps) {
  const [form, setForm] = useState<DealFormData>({
    name: deal.name,
    value: deal.value !== null ? String(deal.value) : "",
    stage: deal.stage,
    expected_close_date: deal.expected_close_date ?? "",
    owner_id: deal.owner_id ?? "",
    contact_id: deal.contact_id ?? "",
    company_id: deal.company_id ?? "",
    notes: deal.notes ?? "",
  });
  const [loading, setLoading] = useState(false);

  function update(field: keyof DealFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    try {
      const result = await updateDeal(deal.id, form);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Deal updated");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
          <DialogDescription>Update deal details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DealFormFields
            form={form}
            onChange={update}
            contacts={contacts}
            companies={companies}
            members={members}
          />

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
