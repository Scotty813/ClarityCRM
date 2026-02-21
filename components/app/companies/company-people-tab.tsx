"use client";

import { Mail, User } from "lucide-react";
import type { Contact } from "@/lib/types/database";

interface CompanyPeopleTabProps {
  contacts: Contact[];
  companyId: string;
}

export function CompanyPeopleTab({ contacts }: CompanyPeopleTabProps) {
  if (contacts.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <User className="mx-auto mb-3 size-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No contacts at this company yet.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y px-6">
      {contacts.map((contact) => (
        <div key={contact.id} className="flex items-center gap-3 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <User className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {contact.first_name} {contact.last_name}
            </p>
            {contact.job_title && (
              <p className="truncate text-xs text-muted-foreground">
                {contact.job_title}
              </p>
            )}
          </div>
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="size-4" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
