"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Plus, Search, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { deleteContact } from "@/lib/actions/contacts";
import { CreateContactDialog } from "./create-contact-dialog";
import { ContactDetailDialog } from "./contact-detail-dialog";
import type { ContactWithCompany } from "@/lib/types/database";

interface CompanyOption {
  id: string;
  name: string;
}

interface ContactsTableProps {
  contacts: ContactWithCompany[];
  companies: CompanyOption[];
}

export function ContactsTable({ contacts, companies }: ContactsTableProps) {
  const { can } = usePermissions();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactWithCompany | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const query = search.toLowerCase();
  const filtered = contacts.filter(
    (c) =>
      c.first_name.toLowerCase().includes(query) ||
      c.last_name.toLowerCase().includes(query) ||
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.company_name?.toLowerCase().includes(query)
  );

  function getInitials(firstName: string, lastName: string) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  async function handleDelete(e: React.MouseEvent, contact: ContactWithCompany) {
    e.stopPropagation();
    if (!confirm(`Delete "${contact.first_name} ${contact.last_name}"? This cannot be undone.`)) return;

    const result = await deleteContact(contact.id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Contact deleted");
      if (selectedContact?.id === contact.id) setSelectedContact(null);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
            <p className="text-sm text-muted-foreground">
              {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
            </p>
          </div>
          {can("contact:create") && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Add Contact
            </Button>
          )}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <User className="mb-3 size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {contacts.length === 0
                ? "No contacts yet. Add your first contact to get started."
                : "No contacts match your search"}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedContact(contact);
                      setDetailOpen(true);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="default">
                          <AvatarFallback>
                            {getInitials(contact.first_name, contact.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {contact.first_name} {contact.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contact.email ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contact.company_name ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contact.job_title ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(contact.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {can("contact:edit") && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedContact(contact);
                                setDetailOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 size-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {can("contact:delete") && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => handleDelete(e, contact)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <CreateContactDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        companies={companies}
      />

      <ContactDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        contact={selectedContact}
        companies={companies}
      />
    </>
  );
}
