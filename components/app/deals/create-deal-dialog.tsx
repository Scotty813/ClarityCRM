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
import { createDeal } from "@/lib/actions/deals";
import { DealFormFields } from "./deal-form-fields";
import type { DealFormData } from "@/lib/types/database";

interface SelectOption {
  id: string;
  name: string;
}

interface CreateDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: SelectOption[];
  companies: SelectOption[];
  members: SelectOption[];
}

const EMPTY_FORM: DealFormData = {
  name: "",
  value: "",
  stage: "qualified",
  expected_close_date: "",
  owner_id: "",
  contact_id: "",
  company_id: "",
  notes: "",
};

export function CreateDealDialog({
  open,
  onOpenChange,
  contacts,
  companies,
  members,
}: CreateDealDialogProps) {
  const [form, setForm] = useState<DealFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  function update(field: keyof DealFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    try {
      const result = await createDeal(form);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Deal created");
      setForm(EMPTY_FORM);
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
          <DialogTitle>Add Deal</DialogTitle>
          <DialogDescription>
            Create a new deal in your pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DealFormFields
            form={form}
            onChange={update}
            contacts={contacts}
            companies={companies}
            members={members}
            hideOwner
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
              {loading ? "Creating..." : "Create Deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
