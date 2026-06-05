import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Sparkles, Workflow, Package, Megaphone, Lock, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Income Systems Lab" },
      { name: "description", content: "Your AI Income Systems Lab dashboard — continue the course, open the prompt library, and launch the AI builders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

const quickStart = [
  { to: "/course", title: "Continue the course", desc: "11 modules · 90+ lessons", icon: BookOpen, monthlyOk: true },
  { to: "/prompts", title: "Open prompt library", desc: "Browse and save prompts", icon: Sparkles, monthlyOk: true },
  { to: "/builders/product", title: "Plan a digital product", desc: "Generate an offer in minutes", icon: Package, monthlyOk: false },
  { to: "/builders/funnel", title: "Map a sales funnel", desc: "End-to-end funnel blueprint", icon: Megaphone, monthlyOk: false },
  { to: "/workflows", title: "Browse n8n workflows", desc: "Templates to copy and run", icon: Workflow, monthlyOk: false },
];

const BANNER_DISMISS_KEY = "ails:monthly-upgrade-banner-dismissed";

function MonthlyUpgradeBanner() {
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    setDismissed(typeof window !== "undefined" && localStorage.getItem(BANNER_DISMISS_KEY) === "1");
  }, []);
  const dismiss = () => {
    localStorage.setItem(BANNER_DISMISS_KEY, "1");
    setDismissed(true);
  };
  if (dismissed) return null;
  return (
    <div className="mb-6 relative rounded-2xl glass-strong p-5 sm:p-6 ring-brand">
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-white/10 text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between pr-8">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-2)]">All-Access Monthly · $14.99/mo</p>
          <h3 className="mt-1 font-semibold">Enjoying the course? Upgrade to lifetime.</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Builder Lab is one payment of $79 — keeps the course forever and unlocks the Product Builder, Funnel Builder, and n8n library.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button onClick={dismiss} variant="glass" size="sm">Dismiss</Button>
          <Button asChild variant="brand" size="sm">
            <Link to="/pricing">See upgrade options <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { profile, user } = useAuth();
  const name = profile?.display_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Builder";
  const tier = profile?.tier ?? "none";
  const isMonthly = tier === "monthly";
  const isNone = tier === "none";

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {isMonthly && <MonthlyUpgradeBanner />}

      <div className="relative overflow-hidden rounded-3xl glass-strong p-8 sm:p-10">
        <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "var(--gradient-hero)" }} />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Welcome back</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
          Hey {name}, ready to <span className="text-gradient">ship something</span>?
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          Your lab is set up. Course content, prompts, and builders unlock based on your tier.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="brand"><Link to="/course">Open course <ArrowRight className="h-4 w-4" /></Link></Button>
          {isNone && (
            <Button asChild variant="glass"><Link to="/pricing">Unlock full access</Link></Button>
          )}
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Course progress</h2>
          <Link to="/course" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span>0 of 90 lessons completed</span>
            <span className="text-muted-foreground">0%</span>
          </div>
          <Progress value={0} className="h-2" />
          <p className="mt-3 text-xs text-muted-foreground">
            Start with Module 1 — AI Money Foundations. Build the mental model first.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Quick start</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickStart.map((q) => {
            const lockedForNone = isNone && q.to !== "/course";
            const lockedForMonthly = isMonthly && !q.monthlyOk;
            const locked = lockedForNone || lockedForMonthly;
            return (
              <Link
                key={q.to}
                to={q.to}
                className="glass rounded-2xl p-5 hover:bg-white/8 transition flex items-start gap-3 group"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg shrink-0" style={{ background: "var(--gradient-soft)" }}>
                  {locked ? <Lock className="h-5 w-5 text-muted-foreground" /> : <q.icon className="h-5 w-5 text-[color:var(--brand)]" />}
                </div>
                <div className="min-w-0">
                  <p className="font-medium group-hover:text-gradient">{q.title}</p>
                  <p className="text-xs text-muted-foreground">{q.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
