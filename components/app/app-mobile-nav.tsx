"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut, Monitor, Moon, Sun, User, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

interface AppMobileNavProps {
  email: string;
  navLinks: NavLink[];
  onSignOut: () => void;
}

export function AppMobileNav({ email, navLinks, onSignOut }: AppMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  function handleSignOut() {
    setOpen(false);
    onSignOut();
  }

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
            ClarityCRM
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {navLinks.map((link) => (
            <SheetClose key={link.href} asChild>
              <Link
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
          <div className="my-2 border-t border-border" />
          <SheetClose asChild>
            <Link
              href="/settings/profile"
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/settings/profile"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <User className="size-4" />
              Profile
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/settings/team"
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/settings/team"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Users className="size-4" />
              Team members
            </Link>
          </SheetClose>
        </nav>
        <SheetFooter>
          <div className="flex items-center justify-center gap-1">
            <Button
              variant={theme === "light" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setTheme("light")}
              aria-label="Light theme"
            >
              <Sun className="size-4" />
            </Button>
            <Button
              variant={theme === "dark" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setTheme("dark")}
              aria-label="Dark theme"
            >
              <Moon className="size-4" />
            </Button>
            <Button
              variant={theme === "system" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setTheme("system")}
              aria-label="System theme"
            >
              <Monitor className="size-4" />
            </Button>
          </div>
          <span className="truncate text-center text-sm text-muted-foreground">
            {email}
          </span>
          <Button
            variant="ghost"
            className="w-full justify-center"
            onClick={handleSignOut}
          >
            <LogOut className="mr-1.5 size-4" />
            Log out
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
