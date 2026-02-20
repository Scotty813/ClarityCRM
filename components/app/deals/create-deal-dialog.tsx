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
import { createDeal } from "@/lib/actions/deals";
import { DealFormFields } from "./deal-form-fields";
import { zodResolverCompat, dealFormSchema, type DealFormValues } from "@/lib/validations/deal";

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

const DEFAULT_VALUES: DealFormValues = {
  name: "",
  value: "",
  stage: "qualified",
  expected_close_date: "",
  owner_id: "",
  contact_id: "",
  company_id: "",
  notes: "",
  lost_reason: "",
};

export function CreateDealDialog({
  open,
  onOpenChange,
  contacts,
  companies,
  members,
}: CreateDealDialogProps) {
  const form = useForm<DealFormValues>({
    resolver: zodResolverCompat(dealFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  async function onSubmit(values: DealFormValues) {
    const result = await createDeal(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Deal created");
    form.reset(DEFAULT_VALUES);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) form.reset(DEFAULT_VALUES);
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Deal</DialogTitle>
          <DialogDescription>
            Create a new deal in your pipeline.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DealFormFields
              form={form}
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Deal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
