"use client";

import { useForm } from "react-hook-form";
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
import { Form } from "@/components/ui/form";
import { updateDeal } from "@/lib/actions/deals";
import { DealFormFields } from "./deal-form-fields";
import { zodResolverCompat, dealFormSchema, type DealFormValues } from "@/lib/validations/deal";
import type { DealWithRelations } from "@/lib/types/database";

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
  const form = useForm<DealFormValues>({
    resolver: zodResolverCompat(dealFormSchema),
    defaultValues: {
      name: deal.name,
      value: deal.value !== null ? String(deal.value) : "",
      stage: deal.stage,
      expected_close_date: deal.expected_close_date ?? "",
      owner_id: deal.owner_id ?? "",
      contact_id: deal.contact_id ?? "",
      company_id: deal.company_id ?? "",
      notes: deal.notes ?? "",
      lost_reason: deal.lost_reason ?? "",
    },
  });

  async function onSubmit(values: DealFormValues) {
    const result = await updateDeal(deal.id, values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Deal updated");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
          <DialogDescription>Update deal details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DealFormFields
              form={form}
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
