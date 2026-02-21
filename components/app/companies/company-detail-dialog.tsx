"use client";

import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { updateCompany, deleteCompany } from "@/lib/actions/companies";
import type { Company, CompanyFormData } from "@/lib/types/database";

function companyToForm(company: Company): CompanyFormData {
  return {
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
  };
}

interface CompanyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  defaultEditing?: boolean;
}

export function CompanyDetailDialog({
  open,
  onOpenChange,
  company,
  defaultEditing = false,
}: CompanyDetailDialogProps) {
  const { can } = usePermissions();
  const [editing, setEditing] = useState(defaultEditing);
  const [form, setForm] = useState<CompanyFormData>(
    company ? companyToForm(company) : companyToForm({} as Company)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (company) {
      setForm(companyToForm(company));
      setEditing(defaultEditing);
    }
  }, [company, defaultEditing]);

  function update(field: keyof CompanyFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!company) return;

    setLoading(true);
    try {
      const result = await updateCompany(company.id, form);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Company updated");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!company) return;
    if (!confirm(`Delete "${company.name}"? This cannot be undone.`)) return;

    setLoading(true);
    try {
      const result = await deleteCompany(company.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Company deleted");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function formatAddress(c: Company) {
    const parts = [c.address_line1, c.address_line2, c.city, c.state, c.postal_code, c.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {company && (
          <>
            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Edit Company</DialogTitle>
                  <DialogDescription>
                    Update company details.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                  <Label htmlFor="edit-name">Company name</Label>
                  <Input
                    id="edit-name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-domain">Website</Label>
                    <Input
                      id="edit-domain"
                      value={form.domain}
                      onChange={(e) => update("domain", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-industry">Industry</Label>
                    <Input
                      id="edit-industry"
                      value={form.industry}
                      onChange={(e) => update("industry", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    placeholder="Street address"
                    value={form.address_line1}
                    onChange={(e) => update("address_line1", e.target.value)}
                  />
                  <Input
                    placeholder="Apt, suite, etc."
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
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForm(companyToForm(company));
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <>
                <DialogHeader className="flex-row items-center gap-4 space-y-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <Building2 className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="truncate">
                      {company.name}
                    </DialogTitle>
                    {company.industry && (
                      <DialogDescription className="truncate">
                        {company.industry}
                      </DialogDescription>
                    )}
                  </div>
                </DialogHeader>

                <div className="space-y-3 pt-2">
                  {company.domain && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Website</span>
                      <span className="text-sm">{company.domain}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Phone</span>
                      <span className="text-sm">{company.phone}</span>
                    </div>
                  )}
                  {formatAddress(company) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Address</span>
                      <span className="text-right text-sm">{formatAddress(company)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">
                      {new Date(company.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {company.notes && (
                    <div className="pt-1">
                      <span className="text-sm text-muted-foreground">Notes</span>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{company.notes}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex gap-2">
                  {can("company:edit") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                  {can("company:delete") && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      disabled={loading}
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
