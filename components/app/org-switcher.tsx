"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { switchOrganization } from "@/lib/actions/organizations";
import type { UserOrganization } from "@/lib/types/database";

interface OrgSwitcherProps {
  organizations: UserOrganization[];
  activeOrgId: string;
}

export function OrgSwitcher({ organizations, activeOrgId }: OrgSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeOrg = organizations.find((org) => org.id === activeOrgId);

  function handleSwitch(orgId: string) {
    if (orgId === activeOrgId) {
      setOpen(false);
      return;
    }

    startTransition(async () => {
      await switchOrganization(orgId);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Switch organization"
          className="h-auto gap-1.5 px-2 py-1.5 font-medium"
          disabled={isPending}
        >
          <Building2 className="size-4 shrink-0 text-muted-foreground" />
          <span className="max-w-[160px] truncate">
            {activeOrg?.name ?? "Select org"}
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        <div className="grid gap-0.5">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSwitch(org.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent disabled:opacity-50"
              disabled={isPending}
            >
              <Check
                className={`size-3.5 shrink-0 ${
                  org.id === activeOrgId
                    ? "text-primary opacity-100"
                    : "opacity-0"
                }`}
              />
              <span className="truncate">{org.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-1 border-t border-border pt-1">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/create-org");
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Plus className="size-3.5 shrink-0" />
            Create organization
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
