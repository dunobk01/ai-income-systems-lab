import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, Copy, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShareResultButton, TryAnotherTools } from "@/components/free-tools/tool-cards";
import { ogImageMeta } from "@/lib/og";
import { dlToolComplete, dlToolCtaClick, dlToolStart } from "@/lib/free-tools";
import {
  BUSINESS_TYPES,
  GOALS,
  generatePrompts,
  type GeneratedPrompt,
} from "@/lib/prompt-generator-data";

const SLUG = "ai-prompt-generator";
const TITLE = "AI Prompt Generator — AI Prompts by Business Type";
const DESC =
  "Get AI prompts by business type and goal. Pick freelancer, agency, e-commerce, local service and more, then copy three detailed, ready-to-run prompts for ChatGPT or Claude. Free, no signup.";
const URL = "https://ai-income-systems.com/free-tools/prompt-generator";

const FAQS = [
  {
    q: "Do I need an account to use it?",
    a: "No. Choose your business type and goal, press generate, and copy the prompts. Nothing is gated.",
  },
  {
    q: "Which AI tools do these prompts work with?",
    a: "Any capable chat model — ChatGPT, Claude, Gemini or an assistant inside your own tools. They're plain text, so paste and go.",
  },
  {
    q: "Why are the prompts so long?",
    a: "Short prompts get generic answers. Each prompt sets a role, the audience, hard constraints, a tone and an exact output format, which is what makes the result usable.",
  },
  {
    q: "What does Regenerate do?",
    a: "It swaps in three different angles for the same business type and goal, so you can work through several approaches without retyping anything.",
  },
];

export const Route = createFileRoute("/free-tools/prompt-generator")({
  head: () => ({
    meta: [
      { title: `${TITLE} — Free Tool` },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
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
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: TITLE,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: URL,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: PromptGeneratorPage,
});

const selectClass =
  "w-full h-11 rounded-xl bg-[color:var(--card)]/60 border border-[color:var(--border)] px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color:var(--brand-2)]/40";

function PromptCard({ prompt }: { prompt: GeneratedPrompt }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="glass rounded-2xl p-5 flex flex-col">
      <h3 className="text-base font-semibold leading-snug">{prompt.title}</h3>
      <div className="mt-3 max-h-80 overflow-y-auto rounded-xl border border-[color:var(--border)] bg-[color:var(--background)]/60 p-4">
        <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-relaxed text-muted-foreground">
          {prompt.text}
        </pre>
      </div>
      <Button
        variant="brand"
        className="mt-4 h-11 w-full"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(prompt.text);
            setCopied(true);
            dlToolCtaClick(SLUG, { location: "copy-prompt" });
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* clipboard unavailable */
          }
        }}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy prompt"}
      </Button>
    </div>
  );
}

function PromptGeneratorPage() {
  const [business, setBusiness] = useState("");
  const [goal, setGoal] = useState("");
  const [description, setDescription] = useState("");
  const [round, setRound] = useState(0);
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [error, setError] = useState("");

  const run = (nextRound: number) => {
    if (!business || !goal) {
      setError("Pick a business type and a goal first.");
      return;
    }
    setError("");
    if (prompts.length === 0) dlToolStart(SLUG, { business_type: business, goal });
    setRound(nextRound);
    setPrompts(generatePrompts({ businessValue: business, goalValue: goal, description, round: nextRound }));
    dlToolComplete(SLUG, { business_type: business, goal, round: nextRound });
    if (typeof window !== "undefined") {
      setTimeout(() => document.getElementById("prompt-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-14 sm:pt-20 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free tool · no signup
          </div>
          <h1 className="mt-5 text-3xl sm:text-5xl font-black tracking-tight">
            AI <span className="text-gradient">Prompt Generator</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Pick your business type and what you're trying to do. Get three detailed, production-ready prompts
            you can paste straight into ChatGPT or Claude — no editing required.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-10">
        <div className="glass-strong rounded-3xl p-5 sm:p-7 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pg-business" className="text-sm font-medium">
                Business type
              </label>
              <select
                id="pg-business"
                className={`mt-2 ${selectClass}`}
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
              >
                <option value="">Select your business type…</option>
                {BUSINESS_TYPES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pg-goal" className="text-sm font-medium">
                Goal
              </label>
              <select
                id="pg-goal"
                className={`mt-2 ${selectClass}`}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              >
                <option value="">What do you want the AI to do?…</option>
                {GOALS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="pg-desc" className="text-sm font-medium">
              Describe your business in one sentence{" "}
              <span className="text-muted-foreground font-normal">(optional — makes prompts more specific)</span>
            </label>
            <Input
              id="pg-desc"
              className="mt-2 h-11"
              maxLength={200}
              placeholder="e.g. I install and service HVAC systems for homeowners in north Phoenix."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="brand" size="lg" className="h-12 px-7" onClick={() => run(0)}>
              <Wand2 className="h-4 w-4" /> Generate prompts
            </Button>
            {prompts.length > 0 ? (
              <Button variant="glass" size="lg" className="h-12 px-7" onClick={() => run(round + 1)}>
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {prompts.length > 0 ? (
        <section id="prompt-results" className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
          <h2 className="text-2xl font-bold tracking-tight">Your three prompts</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Copy one, paste it into ChatGPT or Claude, and answer anything it asks you for.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {prompts.map((p) => (
              <PromptCard key={p.id} prompt={p} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <ShareResultButton
              toolSlug={SLUG}
              title="AI Prompt Generator"
              text="Three copy-ready AI prompts for your business, free."
            />
          </div>
          <TryAnotherTools exclude={SLUG} />
        </section>
      ) : null}

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
        <h2 className="text-2xl font-bold tracking-tight text-center">Questions people ask</h2>
        <div className="mt-6 space-y-3">
          {FAQS.map((f) => (
            <div key={f.q} className="glass rounded-2xl p-5">
              <p className="font-semibold">{f.q}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">
        <div className="glass-strong rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="text-2xl sm:text-3xl font-bold">Good prompts are step one. Systems are step two.</h2>
          <p className="mt-2 text-muted-foreground">
            The Lab shows you how to wire prompts like these into workflows that run without you.
          </p>
          <Button asChild size="lg" variant="brand" className="mt-6 h-12 px-7" onClick={() => dlToolCtaClick(SLUG, { location: "footer-cta" })}>
            <Link to="/pricing">
              See pricing <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
