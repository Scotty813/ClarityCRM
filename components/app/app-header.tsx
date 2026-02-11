"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { OrgSwitcher } from "@/components/app/org-switcher";
import type { UserOrganization } from "@/lib/types/database";

interface AppHeaderProps {
  email: string;
  organizations: UserOrganization[];
  activeOrgId: string;
}

export function AppHeader({ email, organizations, activeOrgId }: AppHeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <a href="/dashboard" className="text-xl font-bold tracking-tight text-primary">
            ClarityCRM
          </a>
          <span className="text-border">/</span>
          <OrgSwitcher organizations={organizations} activeOrgId={activeOrgId} />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{email}</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-1.5 size-4" />
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
