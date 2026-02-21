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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getInitials } from "@/lib/utils";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { updateContact, deleteContact } from "@/lib/actions/contacts";
import { zodResolverCompat } from "@/lib/validations/resolver";
import {
  editContactFormSchema,
  type EditContactFormValues,
} from "@/lib/validations/contact";
import type { ContactWithCompany } from "@/lib/types/database";

interface CompanyOption {
  id: string;
  name: string;
}

interface ContactDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: ContactWithCompany | null;
  companies: CompanyOption[];
}

export function ContactDetailDialog({
  open,
  onOpenChange,
  contact,
  companies,
}: ContactDetailDialogProps) {
  const { can } = usePermissions();
  const canEdit = can("contact:edit");
  const canDelete = can("contact:delete");

  const form = useForm<EditContactFormValues>({
    resolver: zodResolverCompat(editContactFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      job_title: "",
      company_id: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (contact) {
      form.reset({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        job_title: contact.job_title ?? "",
        company_id: contact.company_id ?? "",
        notes: contact.notes ?? "",
      });
    }
  }, [contact, form]);

  async function onSubmit(values: EditContactFormValues) {
    if (!contact) return;

    try {
      const result = await updateContact(contact.id, values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Contact updated");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete() {
    if (!contact) return;
    if (!confirm(`Delete "${contact.first_name} ${contact.last_name}"? This cannot be undone.`)) return;

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
    }
  }

  const fullName = contact
    ? `${contact.first_name} ${contact.last_name}`
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {contact && (
          <>
            <DialogHeader className="flex-row items-center gap-4 space-y-0">
              <Avatar size="lg">
                <AvatarFallback>
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate">{fullName}</DialogTitle>
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

            {canEdit ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="job_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <Select
                            value={field.value || "none"}
                            onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No company</SelectItem>
                              {companies.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between pt-2">
                    {canDelete && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                      >
                        Delete
                      </Button>
                    )}
                    <div className="ml-auto flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!form.formState.isDirty || form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            ) : (
              <>
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
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
