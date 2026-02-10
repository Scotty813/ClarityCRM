import Link from "next/link";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { MobileNav } from "./mobile-nav";
import { AuthModalTrigger } from "@/components/auth/auth-modal-trigger";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          ClarityCRM
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <AuthModalTrigger mode="login" variant="ghost" size="sm">
                Log in
              </AuthModalTrigger>
              <AuthModalTrigger
                mode="signup"
                size="sm"
                className="rounded-full bg-gradient-to-r from-gradient-from to-gradient-to text-primary-foreground hover:opacity-90"
              >
                Get Started
              </AuthModalTrigger>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <MobileNav user={user} />
      </div>
    </header>
  );
}
