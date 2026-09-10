import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Download, Loader2, Mail, Sparkles, Workflow, FileText, Zap } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLead } from "@/lib/leads.functions";
import { ogImageMeta } from "@/lib/og";
import { dlLead } from "@/lib/datalayer";
import { pinLead } from "@/lib/pinterest";
import { tiktokIdentify, tiktokTrack } from "@/lib/tiktok";

const SLUG = "ai-income-operating-system";
const PDF = "/downloads/ai-income-operating-system.pdf";
const TITLE = "Free Download: The AI Income Operating System";
const DESC =
  "Get the free AI Income Operating System PDF — the prompts, automations and playbooks that turn scattered AI tools into one repeatable income system. No card required.";
const URL = "https://ai-income-systems.com/os";

const INSIDE = [
  {
    icon: Sparkles,
    t: "The prompt layer",
    d: "Engineered prompts for ChatGPT, Claude and Perplexity — role, context, output spec, format. Copy, paste, ship.",
  },
  {
    icon: Workflow,
    t: "The automation layer",
    d: "How to wire the repeatable work into n8n so your content, follow-up and delivery run without you.",
  },
  {
    icon: FileText,
    t: "The offer layer",
    d: "Turning outputs into products and services people actually pay for — pricing, packaging and delivery.",
  },
  {
    icon: Zap,
    t: "The operating rhythm",
    d: "A weekly cadence so the system compounds instead of stalling out after week one.",
  },
];

const FAQS = [
  {
    q: "What do I get when I sign up?",
    a: "The AI Income Operating System PDF unlocks instantly on the next screen, and a copy goes to your inbox. You also get a permanent free account with Module 1 and the sample lessons.",
  },
  {
    q: "Is it really free?",
    a: "Yes. No card, no trial. Enter your email and the download appears immediately.",
  },
  {
    q: "Do I need paid AI tools?",
    a: "No. Everything in the guide works on the free tiers of ChatGPT, Claude, Perplexity and n8n.",
  },
  {
    q: "Will you spam me?",
    a: "No. You get the guide plus a short follow-up walking you through it. One-click unsubscribe on every email.",
  },
];

export const Route = createFileRoute("/os")({
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
  component: OperatingSystemPage,
});

function OperatingSystemPage() {
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
        data: { email, source: "ai-income-operating-system-landing", lead_magnet: SLUG, audience: "free", company },
      });
      setState("done");
      void tiktokIdentify({ email });
      tiktokTrack("Lead", {
        contents: [{ content_id: SLUG, content_type: "product", content_name: SLUG }],
        value: 0,
        currency: "USD",
      });
      dlLead({ lead_source: "ai-income-operating-system-landing", lead_magnet: SLUG });
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

        <h1 className="mt-4 text-4xl sm:text-6xl font-black tracking-tight max-w-3xl">
          The AI Income <span className="text-[color:var(--brand-2)]">Operating System</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl">
          Collecting AI tools isn't a business. This free guide shows you how to connect prompts, automations and offers
          into one system that keeps running after you close the laptop.
        </p>

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
                A copy is on its way to your inbox too. Create your free account to unlock Module 1 and the sample
                lessons.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Button asChild variant="brand" size="lg">
                  <a href={PDF} download>
                    <Download className="h-4 w-4" /> Download the PDF
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
                  <Mail className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Instant download + free account
                </div>
                <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">Send me the guide</h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                  Enter your email and the PDF unlocks immediately. One-click unsubscribe, always.
                </p>
              </div>
              <form onSubmit={submit} className="relative flex flex-col sm:flex-row gap-2 md:w-[420px]">
                <label className="sr-only" htmlFor="os-email">
                  Email address
                </label>
                <Input
                  id="os-email"
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

        {/* Inside */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">What's inside</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {INSIDE.map((c) => (
              <div key={c.t} className="glass rounded-2xl p-5">
                <c.icon className="h-5 w-5 text-[color:var(--brand-2)]" />
                <h3 className="mt-3 font-semibold">{c.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
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
            Also free: the{" "}
            <Link to="/free" className="hover:text-foreground underline">
              7-Day AI Income System Map
            </Link>{" "}
            and{" "}
            <Link to="/ai-business-engine" className="hover:text-foreground underline">
              20 AI prompts + n8n guide
            </Link>
            .
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
