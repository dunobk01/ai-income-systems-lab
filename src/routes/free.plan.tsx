import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Clock, Copy, Loader2, Lock, Wrench, AlertTriangle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { submitLead } from "@/lib/leads.functions";
import { FREE_KIT, FREE_KIT_DAYS } from "@/lib/free-kit-data";
import { isFreeKitUnlocked, markFreeKitUnlocked } from "@/lib/free-kit-access";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/free/plan")({
  head: () => ({
    meta: [
      { title: "The 7-Day AI Income System Map — AI Income Systems Lab" },
      {
        name: "description",
        content:
          "Your free 7-day plan: one validated offer, a live page, an automated follow-up, and a weekly operating rhythm.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: FreePlanPage,
});

function FreePlanPage() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    setUnlocked(isFreeKitUnlocked() || !!user);
  }, [user]);

  if (unlocked === null) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-sm text-muted-foreground">Loading…</main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 pt-14 pb-8">
        <h1 className="text-4xl font-black tracking-tight">{FREE_KIT.name}</h1>
        <p className="mt-3 text-muted-foreground">{FREE_KIT.promise}</p>

        {unlocked ? <PlanBody /> : <UnlockForm onUnlock={() => setUnlocked(true)} />}
      </main>
      <SiteFooter />
    </div>
  );
}

function UnlockForm({ onUnlock }: { onUnlock: () => void }) {
  const fn = useServerFn(submitLead);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await fn({
        data: { email, source: "free-plan-gate", lead_magnet: FREE_KIT.slug, audience: "free", company },
      });
      markFreeKitUnlocked();
      onUnlock();
    } catch (err) {
      toast.error((err as Error).message ?? "Couldn't unlock. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-8 glass-strong rounded-3xl p-6 sm:p-8">
      <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free — enter your email to unlock
      </div>
      <h2 className="mt-3 text-2xl font-bold tracking-tight">Unlock all 7 days</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        No card, no trial. You'll also get a short follow-up sequence that walks you through each day.
      </p>
      <form onSubmit={submit} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-md">
        <label className="sr-only" htmlFor="unlock-email">
          Email address
        </label>
        <Input
          id="unlock-email"
          type="email"
          required
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="h-11"
        />
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
        <Button type="submit" variant="brand" disabled={loading} className="h-11 px-5 whitespace-nowrap">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Unlock the map
        </Button>
      </form>
    </section>
  );
}

function PlanBody() {
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Prompt copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <>
      <section className="mt-8 glass rounded-2xl p-6">
        <h2 className="font-semibold">By the end of day 7 you'll have</h2>
        <ul className="mt-3 space-y-2">
          {FREE_KIT.outcomes.map((o) => (
            <li key={o} className="flex gap-2 text-sm">
              <Check className="h-4 w-4 mt-0.5 shrink-0 text-[color:var(--brand-2)]" />
              <span>{o}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">{FREE_KIT.honesty}</p>
      </section>

      <div className="mt-8 space-y-6">
        {FREE_KIT_DAYS.map((d) => (
          <article key={d.day} id={`day-${d.day}`} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
              <span className="rounded-full glass px-2.5 py-1 uppercase tracking-wide">Day {d.day}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> ~{d.minutes} min
              </span>
              <span className="inline-flex items-center gap-1">
                <Wrench className="h-3.5 w-3.5" /> {d.tools.join(" · ")}
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight">{d.title}</h2>
            <p className="mt-1 text-sm text-[color:var(--brand-2)]">{d.outcome}</p>

            <ol className="mt-4 space-y-2 list-decimal list-inside text-sm text-muted-foreground marker:text-foreground/60">
              {d.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>

            <div className="mt-5 rounded-2xl border border-white/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">Prompt: {d.prompt.label}</h3>
                <Button variant="glass" size="sm" onClick={() => copy(d.prompt.text)}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
              <p className="mt-3 text-xs font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {d.prompt.text}
              </p>
            </div>

            <p className="mt-4 flex gap-2 text-sm text-amber-200/90">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                <span className="font-medium">Common pitfall:</span> {d.pitfall}
              </span>
            </p>
          </article>
        ))}
      </div>

      <section className="mt-10 glass-strong rounded-3xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight">Keep going after day 7</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          A free account keeps Module 1 of the full course, the tool guides, sample prompts and progress
          tracking open permanently. No card required.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild variant="brand">
            <Link to="/signup">
              Create my free account <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="glass">
            <Link to="/curriculum">See the full curriculum</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
