"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { updateContact, deleteContact } from "@/lib/actions/contacts";
import type { ContactWithCompany, ContactFormData } from "@/lib/types/database";

function contactToForm(contact: ContactWithCompany): ContactFormData {
  return {
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    job_title: contact.job_title ?? "",
    company_id: contact.company_id ?? "",
    notes: contact.notes ?? "",
  };
}

interface CompanyOption {
  id: string;
  name: string;
}

interface ContactDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: ContactWithCompany | null;
  companies: CompanyOption[];
  defaultEditing?: boolean;
}

export function ContactDetailDialog({
  open,
  onOpenChange,
  contact,
  companies,
  defaultEditing = false,
}: ContactDetailDialogProps) {
  const { can } = usePermissions();
  const [editing, setEditing] = useState(defaultEditing);
  const [form, setForm] = useState<ContactFormData>(
    contact ? contactToForm(contact) : contactToForm({} as ContactWithCompany)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      setForm(contactToForm(contact));
      setEditing(defaultEditing);
    }
  }, [contact, defaultEditing]);

  function update(field: keyof ContactFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function getInitials(firstName: string, lastName: string) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!contact) return;

    setLoading(true);
    try {
      const result = await updateContact(contact.id, form);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Contact updated");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!contact) return;
    if (!confirm(`Delete "${contact.first_name} ${contact.last_name}"? This cannot be undone.`)) return;

    setLoading(true);
    try {
      const result = await deleteContact(contact.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Contact deleted");
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
        {contact && (
          <>
            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Edit Contact</DialogTitle>
                  <DialogDescription>
                    Update contact details.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-first">First name</Label>
                    <Input
                      id="edit-first"
                      value={form.first_name}
                      onChange={(e) => update("first_name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-last">Last name</Label>
                    <Input
                      id="edit-last"
                      value={form.last_name}
                      onChange={(e) => update("last_name", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Job title</Label>
                    <Input
                      id="edit-title"
                      value={form.job_title}
                      onChange={(e) => update("job_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-company">Company</Label>
                    <Select
                      value={form.company_id || "none"}
                      onValueChange={(v) => update("company_id", v === "none" ? "" : v)}
                    >
                      <SelectTrigger id="edit-company">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No company</SelectItem>
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      setForm(contactToForm(contact));
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
                  <Avatar size="lg">
                    <AvatarFallback>
                      {getInitials(contact.first_name, contact.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="truncate">
                      {contact.first_name} {contact.last_name}
                    </DialogTitle>
                    {contact.job_title && (
                      <DialogDescription className="truncate">
                        {contact.job_title}
                        {contact.company_name ? ` at ${contact.company_name}` : ""}
                      </DialogDescription>
                    )}
                    {!contact.job_title && contact.company_name && (
                      <DialogDescription className="truncate">
                        {contact.company_name}
                      </DialogDescription>
                    )}
                  </div>
                </DialogHeader>

                <div className="space-y-3 pt-2">
                  {contact.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="text-sm">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Phone</span>
                      <span className="text-sm">{contact.phone}</span>
                    </div>
                  )}
                  {contact.company_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Company</span>
                      <span className="text-sm">{contact.company_name}</span>
                    </div>
                  )}
                  {contact.job_title && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Job title</span>
                      <span className="text-sm">{contact.job_title}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">
                      {new Date(contact.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {contact.notes && (
                    <div className="pt-1">
                      <span className="text-sm text-muted-foreground">Notes</span>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{contact.notes}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex gap-2">
                  {can("contact:edit") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                  {can("contact:delete") && (
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
