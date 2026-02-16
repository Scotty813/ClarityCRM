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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createCompany } from "@/lib/actions/companies";
import type { CompanyFormData } from "@/lib/types/database";

const EMPTY_FORM: CompanyFormData = {
  name: "",
  domain: "",
  industry: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  notes: "",
};

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCompanyDialog({ open, onOpenChange }: CreateCompanyDialogProps) {
  const [form, setForm] = useState<CompanyFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  function update(field: keyof CompanyFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    try {
      const result = await createCompany(form);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Company created");
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
          <DialogTitle>Add Company</DialogTitle>
          <DialogDescription>
            Add a new company to your CRM.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company name</Label>
            <Input
              id="company-name"
              placeholder="Acme Inc."
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-domain">Website</Label>
              <Input
                id="company-domain"
                placeholder="acme.com"
                value={form.domain}
                onChange={(e) => update("domain", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-industry">Industry</Label>
              <Input
                id="company-industry"
                placeholder="Technology"
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-phone">Phone</Label>
            <Input
              id="company-phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-address1">Address</Label>
            <Input
              id="company-address1"
              placeholder="Street address"
              value={form.address_line1}
              onChange={(e) => update("address_line1", e.target.value)}
            />
            <Input
              placeholder="Apt, suite, etc. (optional)"
              value={form.address_line2}
              onChange={(e) => update("address_line2", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="City"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
              <Input
                placeholder="State / Province"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Postal code"
                value={form.postal_code}
                onChange={(e) => update("postal_code", e.target.value)}
              />
              <Input
                placeholder="Country"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-notes">Notes</Label>
            <Textarea
              id="company-notes"
              placeholder="Any additional notes..."
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
