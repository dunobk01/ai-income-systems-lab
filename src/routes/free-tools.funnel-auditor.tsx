import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SearchCheck, ArrowRight, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ShareResultButton, TryAnotherTools } from "@/components/free-tools/tool-cards";
import { auditFunnel, type FunnelAudit, type FunnelInput } from "@/lib/funnel-auditor-data";
import { dlToolStart, dlToolComplete, dlToolCtaClick } from "@/lib/free-tools";
import { ogImageMeta } from "@/lib/og";

const TITLE = "Free AI Funnel Auditor — Score Your Offer and Landing Page";
const DESC =
  "Paste your offer, audience, price and landing-page text. Get a conversion score, weak headlines, objection analysis, a revised page structure and a 5-email rescue sequence. Free, no signup.";
const URL = "https://ai-income-systems.com/free-tools/funnel-auditor";

const FAQS = [
  {
    q: "What does the score mean?",
    a: "It measures your page against the eight things that decide whether visitors buy: audience callout, specific outcome, proof, objection handling, clear CTA, price anchoring, honest urgency and enough substance. Higher is better; anything under 60 is losing buyers.",
  },
  {
    q: "Do you store my landing-page text?",
    a: "No. The audit runs and displays in your browser session — the text isn't sent to third parties.",
  },
  {
    q: "Do I need an account?",
    a: "No. Results appear on screen instantly.",
  },
];

const inputClass =
  "w-full rounded-xl glass px-4 py-3 text-sm bg-transparent outline-none focus:ring-2 focus:ring-[color:var(--brand)]";

export const Route = createFileRoute("/free-tools/funnel-auditor")({
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
          name: "AI Funnel Auditor",
          description: DESC,
          url: URL,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: FunnelAuditorPage,
});

function FunnelAuditorPage() {
  const [result, setResult] = useState<FunnelAudit | null>(null);
  const [busy, setBusy] = useState(false);

  const run = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const input: FunnelInput = {
      offer: String(form.get("offer") ?? ""),
      audience: String(form.get("audience") ?? ""),
      price: String(form.get("price") ?? ""),
      pageText: String(form.get("pageText") ?? ""),
    };
    dlToolStart("ai-funnel-auditor");
    const a = auditFunnel(input);
    setResult(a);
    dlToolComplete("ai-funnel-auditor", { score: a.score });
    setBusy(false);
    setTimeout(() => document.getElementById("fa-result")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-14 sm:pt-20 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <SearchCheck className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free tool
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight">
            AI Funnel <span className="text-gradient">Auditor</span>
          </h1>
          <p className="mt-3 mx-auto max-w-xl text-muted-foreground">
            Traffic that doesn't convert has a fixable reason. Paste your page and find yours.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 sm:px-6 pb-8">
        <form onSubmit={run} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label htmlFor="offer" className="text-sm font-medium">Your offer (one sentence)</label>
            <input id="offer" name="offer" required placeholder="e.g. a $27 toolkit that plans a week of meals in 20 minutes" className={`${inputClass} mt-2`} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="audience" className="text-sm font-medium">Who it's for</label>
              <input id="audience" name="audience" required placeholder="e.g. busy parents" className={inputClass} />
            </div>
            <div>
              <label htmlFor="price" className="text-sm font-medium">Price</label>
              <input id="price" name="price" placeholder="e.g. $27" className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="pageText" className="text-sm font-medium">Paste your landing-page text</label>
            <textarea id="pageText" name="pageText" required rows={8} placeholder="Paste everything: headline, paragraphs, bullets, CTA..." className={`${inputClass} mt-2`} />
          </div>
          <Button type="submit" variant="brand" className="w-full h-12" disabled={busy}>
            <Sparkles className="h-4 w-4" /> Audit my funnel
          </Button>
        </form>
      </section>

      {result && (
        <section id="fa-result" className="mx-auto max-w-3xl px-4 sm:px-6 pb-8 space-y-6">
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Conversion readiness</p>
            <p className="mt-2 text-6xl font-black text-gradient">{result.score}</p>
            <p className="mt-1 font-semibold">{result.grade}</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Scorecard</p>
            <ul className="mt-4 space-y-2.5">
              {result.checks.map((c) => (
                <li key={c.label} className="flex items-start gap-2.5 text-sm">
                  {c.pass ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-[color:var(--brand-2)]" />
                  ) : (
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-400" />
                  )}
                  <span>
                    <span className="font-medium">{c.label}</span>
                    {!c.pass && <span className="block text-muted-foreground">{c.tip}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Missing information</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
              {result.missingInfo.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Objection analysis</p>
            <div className="mt-4 space-y-3">
              {result.objections.map((o) => (
                <div key={o.objection} className="text-sm">
                  <p className="font-semibold">"{o.objection}"</p>
                  <p className="text-muted-foreground mt-0.5">{o.response}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Improved offer framing</p>
            <p className="mt-3 text-sm text-foreground/85">{result.improvedOffer}</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Revised page structure</p>
            <div className="mt-4 space-y-3">
              {result.revisedSections.map((s) => (
                <div key={s.section} className="text-sm">
                  <span className="font-semibold text-[color:var(--brand-2)]">{s.section}: </span>
                  <span className="text-foreground/85">{s.example}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Rescue email sequence</p>
            <ol className="mt-4 space-y-3">
              {result.emailSequence.map((e, i) => (
                <li key={e.subject} className="text-sm">
                  <span className="font-semibold text-[color:var(--brand)]">{i + 1}. {e.subject}</span>
                  <span className="block text-muted-foreground">{e.purpose}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="glass-strong rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Your next 3 actions</p>
            <ol className="mt-3 space-y-2 text-sm list-decimal pl-5">
              {result.nextActions.map((a) => <li key={a} className="text-foreground/85">{a}</li>)}
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ShareResultButton
              toolSlug="ai-funnel-auditor"
              title="Free AI Funnel Auditor"
              text="Get your landing page scored against the 8 things that decide whether visitors buy — free:"
            />
            <Button variant="glass" className="h-11 px-5" onClick={() => { dlToolCtaClick("ai-funnel-auditor", { location: "regenerate" }); setResult(null); }}>
              Audit another page
            </Button>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <TryAnotherTools exclude="ai-funnel-auditor" />
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
          <h2 className="text-2xl font-bold">Want the systems behind the sales?</h2>
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
