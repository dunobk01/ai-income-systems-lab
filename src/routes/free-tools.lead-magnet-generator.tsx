import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Magnet, ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ShareResultButton, TryAnotherTools } from "@/components/free-tools/tool-cards";
import { generateLeadMagnet, type LeadMagnet, type LeadMagnetInput } from "@/lib/lead-magnet-generator-data";
import { dlToolStart, dlToolComplete, dlToolCtaClick } from "@/lib/free-tools";
import { ogImageMeta } from "@/lib/og";

const TITLE = "Free Lead-Magnet Generator — Concepts, Landing Copy and a 5-Email Sequence";
const DESC =
  "Enter your niche, audience and offer to get lead-magnet concepts, a full outline, landing-page copy, thank-you-page copy and a 5-email follow-up sequence. Free, no signup.";
const URL = "https://ai-income-systems.com/free-tools/lead-magnet-generator";

const FAQS = [
  {
    q: "What is a lead magnet?",
    a: "A free resource — a checklist, guide or template pack — that you give away in exchange for an email address. It's how most businesses grow their list.",
  },
  {
    q: "Do I need an account?",
    a: "No. Everything appears on screen instantly and is ready to copy.",
  },
  {
    q: "Can I use the copy as-is?",
    a: "Yes — the landing copy and emails are written to be used directly. Replace the [bracketed] placeholders with your specifics.",
  },
];

const inputClass =
  "w-full h-11 rounded-xl glass px-4 text-sm bg-transparent outline-none focus:ring-2 focus:ring-[color:var(--brand)]";

export const Route = createFileRoute("/free-tools/lead-magnet-generator")({
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
          name: "Lead-Magnet Generator",
          description: DESC,
          url: URL,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: LeadMagnetGeneratorPage,
});

function LeadMagnetGeneratorPage() {
  const [result, setResult] = useState<LeadMagnet | null>(null);
  const [busy, setBusy] = useState(false);

  const run = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const input: LeadMagnetInput = {
      niche: String(form.get("niche") ?? ""),
      audience: String(form.get("audience") ?? ""),
      offer: String(form.get("offer") ?? ""),
    };
    dlToolStart("lead-magnet-generator");
    const lm = generateLeadMagnet(input);
    setResult(lm);
    dlToolComplete("lead-magnet-generator", {});
    setBusy(false);
    setTimeout(() => document.getElementById("lm-result")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-14 sm:pt-20 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Magnet className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free tool
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight">
            Lead-Magnet <span className="text-gradient">Generator</span>
          </h1>
          <p className="mt-3 mx-auto max-w-xl text-muted-foreground">
            Concepts, a full outline, landing-page copy and a 5-email follow-up sequence — built from your niche and offer.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 sm:px-6 pb-8">
        <form onSubmit={run} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label htmlFor="niche" className="text-sm font-medium">Your niche or business</label>
            <input id="niche" name="niche" required placeholder="e.g. meal planning for busy parents" className={`${inputClass} mt-2`} />
          </div>
          <div>
            <label htmlFor="audience" className="text-sm font-medium">Who is it for?</label>
            <input id="audience" name="audience" required placeholder="e.g. working moms with picky kids" className={`${inputClass} mt-2`} />
          </div>
          <div>
            <label htmlFor="offer" className="text-sm font-medium">What paid offer should it lead to?</label>
            <input id="offer" name="offer" required placeholder="e.g. my $27 meal-planning toolkit" className={`${inputClass} mt-2`} />
          </div>
          <Button type="submit" variant="brand" className="w-full h-12" disabled={busy}>
            <Sparkles className="h-4 w-4" /> Generate my lead magnet
          </Button>
        </form>
      </section>

      {result && (
        <section id="lm-result" className="mx-auto max-w-3xl px-4 sm:px-6 pb-8 space-y-6">
          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Three concepts</p>
            <div className="mt-4 space-y-3">
              {result.concepts.map((c) => (
                <div key={c.name} className="rounded-xl glass p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h3 className="font-semibold">{c.name}</h3>
                    <span className="text-xs text-muted-foreground">{c.type}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.why}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm"><span className="text-[color:var(--brand)] font-semibold">Our pick: </span>{result.chosen}</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Full outline</p>
            <div className="mt-4 space-y-4">
              {result.outline.map((part) => (
                <div key={part.heading}>
                  <h3 className="font-semibold text-sm">{part.heading}</h3>
                  <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground list-disc pl-5">
                    {part.points.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Starter content (adapt freely)</p>
            <div className="mt-4 space-y-4">
              {result.content.map((c) => (
                <div key={c.heading}>
                  <h3 className="font-semibold text-sm">{c.heading}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Landing-page copy</p>
            <h3 className="mt-3 text-lg font-bold">{result.landingCopy.headline}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{result.landingCopy.subhead}</p>
            <ul className="mt-3 space-y-1.5 text-sm list-disc pl-5">
              {result.landingCopy.bullets.map((b) => <li key={b} className="text-foreground/85">{b}</li>)}
            </ul>
            <p className="mt-4 inline-block rounded-lg glass-strong px-4 py-2 text-sm font-semibold text-[color:var(--brand)]">{result.landingCopy.cta}</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Thank-you page copy</p>
            <h3 className="mt-3 font-bold">{result.thankyouCopy.headline}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{result.thankyouCopy.body}</p>
            <p className="mt-3 text-sm"><span className="font-semibold text-[color:var(--brand-2)]">Next step: </span>{result.thankyouCopy.nextStep}</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">5-email follow-up sequence</p>
            <div className="mt-4 space-y-5">
              {result.emails.map((e, i) => (
                <div key={e.subject}>
                  <p className="text-xs font-semibold text-[color:var(--brand-2)]">Email {i + 1}</p>
                  <p className="text-sm font-semibold">{e.subject}</p>
                  <p className="text-xs text-muted-foreground">{e.preview}</p>
                  <pre className="mt-2 whitespace-pre-wrap text-sm text-foreground/85">{e.body}</pre>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ShareResultButton
              toolSlug="lead-magnet-generator"
              title="Free Lead-Magnet Generator"
              text="Get lead-magnet concepts, landing copy and a 5-email follow-up sequence, free:"
            />
            <Button variant="glass" className="h-11 px-5" onClick={() => { dlToolCtaClick("lead-magnet-generator", { location: "regenerate" }); setResult(null); }}>
              Start over
            </Button>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <TryAnotherTools exclude="lead-magnet-generator" />
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
          <h2 className="text-2xl font-bold">Want the system behind the signups?</h2>
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
