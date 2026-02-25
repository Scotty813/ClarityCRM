"use client";

import { useEffect } from "react";
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
import { updateCompany } from "@/lib/actions/companies";
import { zodResolverCompat } from "@/lib/validations/resolver";
import {
  companyFormSchema,
  type CompanyFormValues,
} from "@/lib/validations/company";
import { CompanyFormFields } from "./company-form-fields";
import type { CompanyWithRelations } from "@/lib/types/database";

interface SelectOption {
  id: string;
  name: string;
}

interface EditCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyWithRelations;
  members: SelectOption[];
}

export function EditCompanyDialog({
  open,
  onOpenChange,
  company,
  members,
}: EditCompanyDialogProps) {
  const form = useForm<CompanyFormValues>({
    resolver: zodResolverCompat(companyFormSchema),
    defaultValues: {
      name: company.name,
      domain: company.domain ?? "",
      industry: company.industry ?? "",
      phone: company.phone ?? "",
      address_line1: company.address_line1 ?? "",
      address_line2: company.address_line2 ?? "",
      city: company.city ?? "",
      state: company.state ?? "",
      postal_code: company.postal_code ?? "",
      country: company.country ?? "",
      notes: company.notes ?? "",
      owner_id: company.owner_id ?? "",
      lifecycle_stage: company.lifecycle_stage,
    },
  });

  useEffect(() => {
    form.reset({
      name: company.name,
      domain: company.domain ?? "",
      industry: company.industry ?? "",
      phone: company.phone ?? "",
      address_line1: company.address_line1 ?? "",
      address_line2: company.address_line2 ?? "",
      city: company.city ?? "",
      state: company.state ?? "",
      postal_code: company.postal_code ?? "",
      country: company.country ?? "",
      notes: company.notes ?? "",
      owner_id: company.owner_id ?? "",
      lifecycle_stage: company.lifecycle_stage,
    });
  }, [company.id]);

  async function onSubmit(values: CompanyFormValues) {
    const result = await updateCompany(company.id, values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Company updated");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>Update company details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CompanyFormFields form={form} members={members} />

            <DialogFooter>
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
