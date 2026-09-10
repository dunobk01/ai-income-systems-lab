import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Download, Loader2, Mail, Sparkles, Workflow, FileText } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLead } from "@/lib/leads.functions";
import { ogImageMeta } from "@/lib/og";
import { dlLead } from "@/lib/datalayer";
import { pinLead } from "@/lib/pinterest";
import { tiktokIdentify, tiktokTrack } from "@/lib/tiktok";
import engine from "@/lib/ai-business-engine.json";

const SLUG = "ai-business-engine";
const PDF = "/downloads/ai-business-engine.pdf";
const TITLE = "The AI Business Engine — 20 Free AI Prompts + n8n Automation Guide";
const DESC =
  "Free PDF: 20 engineered prompts for ChatGPT, Claude and Perplexity across content, digital products, clients and revenue — plus a full n8n automation walkthrough.";
const URL = "https://ai-income-systems.com/ai-business-engine";

const FAQS = [
  {
    q: "What exactly do I get?",
    a: "A 28-page PDF with 20 engineered prompts across four income categories, a step-by-step n8n automation walkthrough, and the build story behind ai-income-systems.com.",
  },
  {
    q: "Is it really free?",
    a: "Yes. Enter your email and the download unlocks immediately — no card, no trial, no upsell wall.",
  },
  {
    q: "Do I need to pay for AI tools to use it?",
    a: "No. Every prompt works on the free tiers of ChatGPT, Claude and Perplexity. n8n has a free plan with 5 active workflows.",
  },
  {
    q: "Will you spam me?",
    a: "No. You get the guide plus a short follow-up sequence walking you through the prompts. One-click unsubscribe on every email.",
  },
];

export const Route = createFileRoute("/ai-business-engine")({
  head: () => ({
    meta: [
      { title: TITLE },
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
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: AiBusinessEnginePage,
});

function AiBusinessEnginePage() {
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
        data: { email, source: "ai-business-engine-landing", lead_magnet: SLUG, audience: "free", company },
      });
      setState("done");
      void tiktokIdentify({ email });
      tiktokTrack("Lead", {
        contents: [{ content_id: SLUG, content_type: "product", content_name: SLUG }],
        value: 0,
        currency: "USD",
      });
      dlLead({ lead_source: "ai-business-engine-landing", lead_magnet: SLUG });
      pinLead({ lead_type: SLUG });
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
          <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free PDF · no card required
        </div>

        <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight max-w-3xl">
          The AI Business Engine
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-[color:var(--brand-2)] font-semibold">{engine.subtitle}</p>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{engine.promise}</p>

        <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
          {engine.stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block text-2xl font-black text-[color:var(--brand-2)]">{s.value}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        {/* Capture */}
        <section id="get" className="mt-10 glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-50" style={{ background: "var(--gradient-hero)" }} />
          {state === "done" ? (
            <div>
              <div className="inline-flex items-center gap-2 text-[color:var(--success)] text-sm font-medium">
                <Check className="h-4 w-4" /> You're in — your download is ready.
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">Grab the PDF</h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                A copy is on its way to your inbox too, so you can find it again later.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Button asChild variant="brand" size="lg">
                  <a href={PDF} download>
                    <Download className="h-4 w-4" /> Download the guide (PDF)
                  </a>
                </Button>
                <Button asChild variant="glass" size="lg">
                  <Link to="/signup">Create my free account</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Instant download + emailed copy
                </div>
                <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">Send me the guide</h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                  Enter your email and the PDF unlocks immediately. One-click unsubscribe, always.
                </p>
              </div>
              <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 md:w-[420px]">
                <label className="sr-only" htmlFor="engine-email">
                  Email address
                </label>
                <Input
                  id="engine-email"
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={state === "loading"}
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
                <Button
                  type="submit"
                  variant="brand"
                  disabled={state === "loading"}
                  className="h-11 px-5 whitespace-nowrap"
                >
                  {state === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Get the free PDF
                </Button>
              </form>
            </div>
          )}
          {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
        </section>

        {/* Contents */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">What's inside</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Twenty engineered prompts — each with a role, context layer, output spec and format instruction — grouped
            into four income categories.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {engine.categories.map((cat) => (
              <div key={cat.name} className="glass rounded-2xl p-5">
                <div className="text-xs uppercase tracking-wide text-[color:var(--brand-2)]">{cat.range}</div>
                <h3 className="mt-1 font-semibold">{cat.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{cat.blurb}</p>
                <ul className="mt-3 space-y-1.5">
                  {cat.prompts.map((p) => (
                    <li key={p.n} className="flex gap-2 text-sm">
                      <Check className="h-4 w-4 mt-0.5 shrink-0 text-[color:var(--brand-2)]" />
                      <span>
                        <span className="text-muted-foreground">{p.n}</span> — {p.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Bonus sections */}
        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="glass rounded-2xl p-5">
            <Workflow className="h-5 w-5 text-[color:var(--brand-2)]" />
            <h3 className="mt-3 font-semibold">The n8n automation layer</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Five walkthroughs that turn the repeatable prompts into scheduled workflows — from your first weekly
              content generator to a fully automated monthly revenue review.
            </p>
          </div>
          <div className="glass rounded-2xl p-5">
            <FileText className="h-5 w-5 text-[color:var(--brand-2)]" />
            <h3 className="mt-3 font-semibold">The Lovable build story</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {engine.includesNote} Spec written in Claude, built in Lovable, live on a real domain — zero lines of
              code.
            </p>
          </div>
        </section>

        {/* How to use */}
        <section className="mt-12 glass rounded-2xl p-6">
          <h2 className="text-xl font-bold tracking-tight">{engine.howToUse.heading}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{engine.howToUse.intro}</p>
          <ol className="mt-4 space-y-3">
            {engine.howToUse.items.map((it, i) => (
              <li key={it.title} className="text-sm">
                <span className="font-semibold">
                  {String(i + 1).padStart(2, "0")} — {it.title}.
                </span>{" "}
                <span className="text-muted-foreground">{it.text}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight">Questions</h2>
          <div className="mt-5 space-y-3">
            {FAQS.map((f) => (
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
              Get the free guide <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Want the 7-day plan too? Grab the{" "}
            <Link to="/free" className="hover:text-foreground underline">
              free AI Income System Map
            </Link>{" "}
            or see{" "}
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
