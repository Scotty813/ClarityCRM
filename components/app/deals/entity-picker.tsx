"use client";

import { useState } from "react";
import { Check, X, Loader2, type LucideIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/lib/types/database";

export interface EntityPickerProps {
  icon: LucideIcon;
  label: string;
  value: string | null;
  placeholder: string;
  options: SelectOption[];
  loading: boolean;
  onSelect: (option: SelectOption | null) => void;
  onOpen: () => void;
}

export function EntityPicker({
  icon: Icon,
  label,
  value,
  placeholder,
  options,
  loading,
  onSelect,
  onOpen,
}: EntityPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Popover
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (next) onOpen();
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "-ml-1.5 rounded-md px-1.5 py-0.5 text-sm font-medium transition-colors hover:bg-muted",
                !value && "text-muted-foreground font-normal"
              )}
            >
              {value ?? placeholder}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <Command>
              <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
              <CommandList>
                <CommandEmpty>
                  {loading ? (
                    <Loader2 className="mx-auto size-4 animate-spin text-muted-foreground" />
                  ) : (
                    "No results found."
                  )}
                </CommandEmpty>
                {value && (
                  <>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          onSelect(null);
                          setOpen(false);
                        }}
                      >
                        <X className="text-muted-foreground" />
                        Remove {label.toLowerCase()}
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.name}
                      onSelect={() => {
                        onSelect(option);
                        setOpen(false);
                      }}
                    >
                      {option.name}
                      {option.name === value && (
                        <Check className="ml-auto text-muted-foreground" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
