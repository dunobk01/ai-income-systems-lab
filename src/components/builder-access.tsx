import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { canUseBuilders } from "@/lib/access";
import { LockedNotice } from "@/components/upgrade-gate";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export function BuilderAccess({ children, title }: { children: ReactNode; title: string }) {
  const { profile, isAdmin, loading, user } = useAuth();
  if (!loading && canUseBuilders(profile?.tier, isAdmin)) return <>{children}</>;
  return <div className="flex min-h-screen flex-col">
    <SiteHeader />
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      {loading ? <p className="mt-6 text-muted-foreground" role="status">Checking membership…</p> : <div className="mt-6 space-y-4">
        <LockedNotice requiredTier="builder">Included with Builder and Accelerator memberships.</LockedNotice>
        {!user && <Button asChild variant="glass"><Link to="/login" search={{ redirect: typeof window === "undefined" ? "/free-tools" : window.location.pathname }}>Sign in</Link></Button>}
        <Button asChild variant="ghost"><Link to="/free-tools/prompt-generator">Use the free AI Prompt Generator</Link></Button>
      </div>}
    </main>
    <SiteFooter />
  </div>;
}