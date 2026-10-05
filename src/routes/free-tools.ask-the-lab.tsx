import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MessagesSquare, ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ShareResultButton, TryAnotherTools } from "@/components/free-tools/tool-cards";
import { askTheLab, type LabAnswer } from "@/lib/ask-the-lab-data";
import { dlToolStart, dlToolComplete, dlToolCtaClick } from "@/lib/free-tools";
import { ogImageMeta } from "@/lib/og";

const TITLE = "Ask the Lab — Free AI Business Advice From the Lab's Own Library";
const DESC =
  "Ask any question about building an AI-powered business — pricing, prompts, lead magnets, automation — and get an answer drawn from the Lab's guides and lessons, with the right next step. Free, no signup.";
const URL = "https://ai-income-systems.com/free-tools/ask-the-lab";

const FAQS = [
  {
    q: "Where do the answers come from?",
    a: "From the Lab's own guides, lessons, tools and FAQs — the same material taught in the course, matched to your question. No outside opinions, no invented facts.",
  },
  {
    q: "Is this a chatbot?",
    a: "It's a focused answer tool: ask a question, get the relevant answer plus links to the exact resources. It doesn't remember previous questions.",
  },
  {
    q: "Do I need an account?",
    a: "No. Ask and read — no signup required.",
  },
];

export const Route = createFileRoute("/free-tools/ask-the-lab")({
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
          name: "Ask the Lab",
          description: DESC,
          url: URL,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: AskTheLabPage,
});

function AskTheLabPage() {
  const [answer, setAnswer] = useState<LabAnswer | null>(null);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);

  const run = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy || !question.trim()) return;
    setBusy(true);
    dlToolStart("ask-the-lab");
    const a = askTheLab(question);
    setAnswer(a);
    dlToolComplete("ask-the-lab", { matched: a.matched });
    setBusy(false);
    setTimeout(() => document.getElementById("lab-answer")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-14 sm:pt-20 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <MessagesSquare className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free tool
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight">
            Ask the <span className="text-gradient">Lab</span>
          </h1>
          <p className="mt-3 mx-auto max-w-xl text-muted-foreground">
            Any question about building an AI-powered business — answered from the Lab's own guides and lessons.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 sm:px-6 pb-8">
        <form onSubmit={run} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label htmlFor="question" className="text-sm font-medium">Your question</label>
            <input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              placeholder="e.g. How do I price my first digital product?"
              className="mt-2 w-full h-11 rounded-xl glass px-4 text-sm bg-transparent outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
            />
          </div>
          <Button type="submit" variant="brand" className="w-full h-12" disabled={busy}>
            <Sparkles className="h-4 w-4" /> Get my answer
          </Button>
          <p className="text-xs text-muted-foreground">
            Try: {["How do I price my first digital product?", "How do I write a better AI prompt?", "How do I get my first email subscribers?", "Where do I start as a beginner?"].map((q) => (
              <button
                key={q}
                type="button"
                className="underline decoration-dotted hover:text-foreground mr-2"
                onClick={() => { setQuestion(q); dlToolCtaClick("ask-the-lab", { location: "suggested-question" }); }}
              >
                {q}
              </button>
            ))}
          </p>
        </form>
      </section>

      {answer && (
        <section id="lab-answer" className="mx-auto max-w-2xl px-4 sm:px-6 pb-8 space-y-4">
          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{answer.title}</p>
            <p className="mt-3 text-sm text-foreground/85 leading-relaxed">{answer.answer}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {answer.links.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className="inline-flex items-center gap-1.5 rounded-lg glass px-3 py-2 text-sm text-[color:var(--brand)] hover:underline"
                >
                  {l.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Other questions I can answer</p>
            <div className="mt-3 space-y-2">
              {answer.alsoTry.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="block text-left text-sm text-[color:var(--brand)] hover:underline"
                  onClick={() => { setQuestion(q); dlToolCtaClick("ask-the-lab", { location: "also-try" }); }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ShareResultButton
              toolSlug="ask-the-lab"
              title="Ask the Lab"
              text="Ask any question about building an AI business — free answers from the Lab's library:"
            />
            <Button variant="glass" className="h-11 px-5" onClick={() => { setAnswer(null); setQuestion(""); }}>
              Ask another
            </Button>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <TryAnotherTools exclude="ask-the-lab" />
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
          <h2 className="text-2xl font-bold">Go deeper than answers — build the system</h2>
          <p className="mt-2 text-muted-foreground">The Lab teaches you to wire AI tools into complete income systems — step by step.</p>
          <Button asChild size="lg" variant="brand" className="mt-6 h-12 px-7">
            <Link to="/pricing">See pricing <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
