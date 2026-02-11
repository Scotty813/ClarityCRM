"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrgSwitcher } from "@/components/app/org-switcher";
import { AppMobileNav } from "@/components/app/app-mobile-nav";
import type { UserOrganization } from "@/lib/types/database";

interface AppHeaderProps {
  email: string;
  organizations: UserOrganization[];
  activeOrgId: string;
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/users", label: "Users" },
];

export function AppHeader({ email, organizations, activeOrgId }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <a href="/dashboard" className="text-xl font-bold tracking-tight text-primary">
              ClarityCRM
            </a>
            <span className="text-border">/</span>
            <OrgSwitcher organizations={organizations} activeOrgId={activeOrgId} />
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 md:flex">
            <span className="text-sm text-muted-foreground">{email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1.5 size-4" />
              Log out
            </Button>
          </div>
          <AppMobileNav email={email} navLinks={navLinks} onSignOut={handleSignOut} />
        </div>
      </div>
    </header>
  );
}
