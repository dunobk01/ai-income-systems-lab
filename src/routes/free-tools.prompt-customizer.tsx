import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SlidersHorizontal, ArrowRight, Sparkles, Copy, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ShareResultButton, TryAnotherTools } from "@/components/free-tools/tool-cards";
import { CUSTOMIZER_CATEGORIES, CUSTOMIZER_TASKS, buildCustomPrompt } from "@/lib/prompt-customizer-data";
import { dlToolStart, dlToolComplete, dlToolCtaClick } from "@/lib/free-tools";
import { ogImageMeta } from "@/lib/og";

const TITLE = "AI Prompt Customizer — Get a Detailed, Ready-to-Use Prompt for Your Task";
const DESC =
  "Pick a task — digital products, websites, Pinterest, email funnels, n8n, social media, Airbnb or KDP — answer three questions, and get one detailed, copy-ready AI prompt. Free, no signup.";
const URL = "https://ai-income-systems.com/free-tools/prompt-customizer";

const FAQS = [
  {
    q: "How is this different from the AI Prompt Generator?",
    a: "The Prompt Generator gives three general prompts for your business. The Customizer builds one deeply detailed prompt around the exact task and answers you provide.",
  },
  {
    q: "Which AI tools does the prompt work with?",
    a: "Any capable assistant — ChatGPT, Claude, Gemini or similar. The prompt includes role, context, task, constraints and output format, which is what every model responds to.",
  },
  {
    q: "Do I need an account?",
    a: "No. The prompt appears instantly on screen, ready to copy.",
  },
];

const inputClass =
  "w-full h-11 rounded-xl glass px-4 text-sm bg-transparent outline-none focus:ring-2 focus:ring-[color:var(--brand)]";

export const Route = createFileRoute("/free-tools/prompt-customizer")({
  head: () => ({
    meta: [
      { title: `${TITLE} — AI Income Systems Lab` },
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
          name: "AI Prompt Customizer",
          description: DESC,
          url: URL,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: PromptCustomizerPage,
});

function PromptCustomizerPage() {
  const [category, setCategory] = useState(CUSTOMIZER_CATEGORIES[0].value);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const cat = CUSTOMIZER_CATEGORIES.find((c) => c.value === category)!;

  const run = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const answers: Record<string, string> = {};
    for (const q of cat.questions) answers[q.key] = String(form.get(q.key) ?? "");
    dlToolStart("ai-prompt-customizer");
    const built = buildCustomPrompt(category, CUSTOMIZER_TASKS[category]?.key ?? "task", answers);
    setPrompt(built);
    dlToolComplete("ai-prompt-customizer", { category });
    setBusy(false);
    setTimeout(() => document.getElementById("pc-result")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const copy = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard unavailable — user can select manually
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-14 sm:pt-20 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free tool
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight">
            AI Prompt <span className="text-gradient">Customizer</span>
          </h1>
          <p className="mt-3 mx-auto max-w-xl text-muted-foreground">
            Answer three questions about your task — get one detailed, engineered prompt you can paste into any AI.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 sm:px-6 pb-8">
        <form onSubmit={run} className="glass rounded-2xl p-6 space-y-4" key={category}>
          <div>
            <label htmlFor="task-category" className="text-sm font-medium">What are you working on?</label>
            <select
              id="task-category"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPrompt(null); }}
              className={`${inputClass} mt-2`}
            >
              {CUSTOMIZER_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          {cat.questions.map((q) => (
            <div key={q.key}>
              <label htmlFor={q.key} className="text-sm font-medium">{q.label}</label>
              {q.key === cat.questions[cat.questions.length - 1].key ? (
                <textarea id={q.key} name={q.key} rows={2} placeholder={q.placeholder} className={`${inputClass} mt-2 h-auto py-3`} />
              ) : (
                <input id={q.key} name={q.key} placeholder={q.placeholder} className={`${inputClass} mt-2`} />
              )}
            </div>
          ))}
          <Button type="submit" variant="brand" className="w-full h-12" disabled={busy}>
            <Sparkles className="h-4 w-4" /> Build my prompt
          </Button>
        </form>
      </section>

      {prompt && (
        <section id="pc-result" className="mx-auto max-w-2xl px-4 sm:px-6 pb-8 space-y-4">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Your custom prompt</p>
              <Button variant="glass" size="sm" className="h-9" onClick={copy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy prompt"}
              </Button>
            </div>
            <pre className="mt-4 whitespace-pre-wrap text-sm text-foreground/85 font-mono leading-relaxed max-h-[480px] overflow-y-auto">{prompt}</pre>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ShareResultButton
              toolSlug="ai-prompt-customizer"
              title="Free AI Prompt Customizer"
              text="Answer 3 questions, get a detailed copy-ready AI prompt for your exact task — free:"
            />
            <Button variant="glass" className="h-11 px-5" onClick={() => { dlToolCtaClick("ai-prompt-customizer", { location: "regenerate" }); setPrompt(null); }}>
              Customize another
            </Button>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <TryAnotherTools exclude="ai-prompt-customizer" />
      </section>

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

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
        <div className="glass-strong rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="text-2xl font-bold">Want the systems behind the prompts?</h2>
          <p className="mt-2 text-muted-foreground">The Lab teaches you to wire AI tools into complete income systems — step by step.</p>
          <Button asChild size="lg" variant="brand" className="mt-6 h-12 px-7">
            <span>
              <a href="/pricing" className="inline-flex items-center gap-2">See pricing <ArrowRight className="h-4 w-4" /></a>
            </span>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
