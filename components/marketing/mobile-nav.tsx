"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { navLinks } from "@/lib/constants";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="text-left text-lg font-bold tracking-tight text-primary">
            Clarity
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {navLinks.map((link) => (
            <SheetClose key={link.href} asChild>
              <a
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            </SheetClose>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 p-4">
          <Button variant="ghost" className="w-full justify-center">
            Log in
          </Button>
          <Button className="w-full rounded-full bg-gradient-to-r from-gradient-from to-gradient-to text-primary-foreground">
            Get Started
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
