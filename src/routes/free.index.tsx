import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Download, Loader2, Map, Mail, Sparkles, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLead } from "@/lib/leads.functions";
import { FREE_KIT, FREE_KIT_DAYS, FREE_KIT_FAQS } from "@/lib/free-kit-data";
import { ogImageMeta } from "@/lib/og";
import { markFreeKitUnlocked } from "@/lib/free-kit-access";
import { dlLead } from "@/lib/datalayer";
import { pinLead } from "@/lib/pinterest";
import { tiktokIdentify, tiktokTrack } from "@/lib/tiktok";

const TITLE = "Free 7-Day AI Income System Map";
const DESC =
  "A free 7-day plan that takes you from a vague AI idea to one validated offer, a live page, and an automated follow-up. No card, no income claims.";
const URL = "https://ai-income-systems.com/free";

export const Route = createFileRoute("/free/")({
  head: () => ({
    meta: [
      { title: `${TITLE} — AI Income Systems Lab` },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      ...ogImageMeta(),
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FREE_KIT_FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: FREE_KIT.name,
          description: FREE_KIT.promise,
          totalTime: "P7D",
          step: FREE_KIT_DAYS.map((d) => ({
            "@type": "HowToStep",
            position: d.day,
            name: d.title,
            text: d.outcome,
          })),
        }),
      },
    ],
  }),
  component: FreeLandingPage,
});

function FreeLandingPage() {
  const navigate = useNavigate();
  const fn = useServerFn(submitLead);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setError(null);
    try {
      await fn({
        data: {
          email,
          source: "free-landing",
          lead_magnet: FREE_KIT.slug,
          audience: "free",
          company,
        },
      });
      markFreeKitUnlocked();
      setState("done");
      void tiktokIdentify({ email });
      tiktokTrack("Lead", {
        contents: [{ content_id: FREE_KIT.slug, content_type: "product", content_name: FREE_KIT.slug }],
        value: 0,
        currency: "USD",
      });
      dlLead({ lead_source: "free-landing", lead_magnet: FREE_KIT.slug });
      pinLead({ lead_type: FREE_KIT.slug });
    } catch (err) {
      setState("error");
      setError((err as Error).message ?? "Couldn't sign you up. Try again.");
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-14 pb-8">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free · no card required
        </div>

        <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight max-w-3xl">
          The 7-Day AI Income System Map
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{FREE_KIT.promise}</p>

        <ul className="mt-6 grid gap-2 sm:grid-cols-2 max-w-3xl">
          {FREE_KIT.outcomes.map((o) => (
            <li key={o} className="flex gap-2 text-sm">
              <Check className="h-4 w-4 mt-0.5 shrink-0 text-[color:var(--brand-2)]" />
              <span>{o}</span>
            </li>
          ))}
        </ul>

        {/* Capture */}
        <section id="get" className="mt-10 glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-50" style={{ background: "var(--gradient-hero)" }} />
          {state === "done" ? (
            <div>
              <div className="inline-flex items-center gap-2 text-[color:var(--success)] text-sm font-medium">
                <Check className="h-4 w-4" /> You're in — the map is unlocked.
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">Two things to do next</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 p-5">
                  <Map className="h-5 w-5 text-[color:var(--brand-2)]" />
                  <h3 className="mt-3 font-semibold">Read the map now</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    All 7 days, steps and prompts — open it straight away.
                  </p>
                  <Button variant="brand" className="mt-4 w-full" onClick={() => navigate({ to: "/free/plan" })}>
                    Open the 7-day map <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button asChild variant="glass" className="mt-2 w-full">
                    <a href="/free/checklist.md" download>
                      <Download className="h-4 w-4" /> Download the checklist
                    </a>
                  </Button>
                </div>
                <div className="rounded-2xl border border-white/10 p-5">
                  <ShieldCheck className="h-5 w-5 text-[color:var(--brand-2)]" />
                  <h3 className="mt-3 font-semibold">Claim your Free plan</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A permanent free account: Module 1 of the course, tool guides, sample prompts and progress
                    tracking. No card.
                  </p>
                  <Button asChild variant="glass" className="mt-4 w-full">
                    <Link to="/signup">Create my free account</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Sent to your inbox + unlocked here
                </div>
                <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">Send me the map</h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                  Enter your email and the full plan opens immediately — plus a short follow-up sequence walking
                  you through each day. One-click unsubscribe, always.
                </p>
              </div>
              <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 md:w-[420px]">
                <label className="sr-only" htmlFor="free-email">
                  Email address
                </label>
                <Input
                  id="free-email"
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={state === "loading"}
                  className="h-11"
                />
                {/* Honeypot: hidden from humans, catches bots */}
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
                <Button type="submit" variant="brand" disabled={state === "loading"} className="h-11 px-5 whitespace-nowrap">
                  {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Get the free map
                </Button>
              </form>
            </div>
          )}
          {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
        </section>

        {/* Preview of the days */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">What's inside</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Each day is one outcome, four steps, one copy-paste prompt, and the mistake that stalls most people.
          </p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {FREE_KIT_DAYS.map((d) => (
              <li key={d.day} className="glass rounded-2xl p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Day {d.day} · ~{d.minutes} min
                </div>
                <h3 className="mt-1 font-semibold">{d.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.outcome}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Honesty */}
        <section className="mt-12 glass rounded-2xl p-6">
          <h2 className="font-semibold">What this is — and isn't</h2>
          <p className="mt-2 text-sm text-muted-foreground">{FREE_KIT.honesty}</p>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight">Questions</h2>
          <div className="mt-5 space-y-3">
            {FREE_KIT_FAQS.map((f) => (
              <details key={f.q} className="glass rounded-2xl p-5">
                <summary className="cursor-pointer font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12 text-center">
          <Button asChild variant="brand" size="lg">
            <a href="#get">
              Get the free 7-day map <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Prefer to browse first? See the{" "}
            <Link to="/curriculum" className="hover:text-foreground underline">
              full curriculum
            </Link>{" "}
            or{" "}
            <Link to="/pricing" className="hover:text-foreground underline">
              pricing
            </Link>
            .
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
