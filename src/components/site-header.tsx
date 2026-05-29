import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const nav = [
  { label: "Curriculum", to: "/#curriculum" as const },
  { label: "Tools", to: "/#tools" as const },
  { label: "Pricing", to: "/pricing" as const },
  { label: "FAQ", to: "/#faq" as const },
];

export function SiteHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 -z-10 backdrop-blur-xl bg-background/70 border-b border-white/5" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          {nav.map((item) => (
            <a key={item.label} href={item.to} className="hover:text-foreground transition">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Button asChild variant="brand" size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login" search={{ redirect: pathname }}>Log in</Link>
              </Button>
              <Button asChild variant="brand" size="sm">
                <Link to="/signup">Start Learning</Link>
              </Button>
            </>
          )}
        </div>
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/5"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-4 flex flex-col gap-2">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <Button asChild variant="brand" className="flex-1">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" className="flex-1">
                    <Link to="/login" search={{ redirect: pathname }}>Log in</Link>
                  </Button>
                  <Button asChild variant="brand" className="flex-1">
                    <Link to="/signup">Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
