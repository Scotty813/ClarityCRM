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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCompany } from "@/lib/actions/companies";
import { LIFECYCLE_STAGES, LIFECYCLE_LABELS } from "@/lib/companies";
import type { CompanyFormData, LifecycleStage } from "@/lib/types/database";

interface SelectOption {
  id: string;
  name: string;
}

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
  owner_id: "",
  lifecycle_stage: "lead",
};

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members?: SelectOption[];
}

export function CreateCompanyDialog({
  open,
  onOpenChange,
  members = [],
}: CreateCompanyDialogProps) {
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
          <DialogDescription>Add a new company to your CRM.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">
              Company name <span className="text-destructive">*</span>
            </Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-owner">Owner</Label>
              <Select
                value={form.owner_id || "none"}
                onValueChange={(v) =>
                  update("owner_id", v === "none" ? "" : v)
                }
              >
                <SelectTrigger id="company-owner">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No owner</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-lifecycle">Lifecycle stage</Label>
              <Select
                value={form.lifecycle_stage}
                onValueChange={(v) =>
                  update("lifecycle_stage", v as LifecycleStage)
                }
              >
                <SelectTrigger id="company-lifecycle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIFECYCLE_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LIFECYCLE_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
