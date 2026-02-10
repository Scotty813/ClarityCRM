import { Button } from "@/components/ui/button";
import { navLinks } from "@/lib/constants";
import { MobileNav } from "./mobile-nav";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="/" className="text-xl font-bold tracking-tight text-primary">
          Clarity
        </a>

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
          <Button variant="ghost" size="sm">
            Log in
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-gradient-to-r from-gradient-from to-gradient-to text-primary-foreground hover:opacity-90"
          >
            Get Started
          </Button>
        </div>

        {/* Mobile menu */}
        <MobileNav />
      </div>
    </header>
  );
}
