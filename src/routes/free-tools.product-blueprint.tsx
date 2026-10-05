import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package, ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ShareResultButton, TryAnotherTools } from "@/components/free-tools/tool-cards";
import { generateBlueprint, type Blueprint, type BlueprintInput } from "@/lib/blueprint-generator-data";
import { dlToolStart, dlToolComplete, dlToolCtaClick } from "@/lib/free-tools";
import { ogImageMeta } from "@/lib/og";

const TITLE = "AI Product Blueprint Generator — Free Digital Product Ideas With a 7-Day Plan";
const DESC =
  "Enter your skills, time and budget and get three realistic digital product ideas, a recommended pick, a 7-day creation plan, pricing, a sales funnel and launch content. Free, no signup.";
const URL = "https://ai-income-systems.com/free-tools/product-blueprint";

const FAQS = [
  {
    q: "Are the product ideas realistic?",
    a: "Yes — the generator only suggests small, buildable products matched to the skills, time and budget you enter. No income promises, just a practical starting point.",
  },
  {
    q: "Do I need an account?",
    a: "No. You get the full blueprint on screen instantly. Nothing is emailed unless you ask.",
  },
  {
    q: "Can I build the product in 7 days?",
    a: "The 7-day plan is calibrated to the weekly time you enter. With a few focused hours a week, a small first product is genuinely achievable.",
  },
];

const inputClass =
  "w-full h-11 rounded-xl glass px-4 text-sm bg-transparent outline-none focus:ring-2 focus:ring-[color:var(--brand)]";

export const Route = createFileRoute("/free-tools/product-blueprint")({
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
          name: "AI Product Blueprint Generator",
          description: DESC,
          url: URL,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: ProductBlueprintPage,
});

function ProductBlueprintPage() {
  const [result, setResult] = useState<Blueprint | null>(null);
  const [busy, setBusy] = useState(false);

  const run = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const input: BlueprintInput = {
      skills: String(form.get("skills") ?? ""),
      hoursPerWeek: String(form.get("hoursPerWeek") ?? "5-10"),
      budget: String(form.get("budget") ?? "0"),
      platform: String(form.get("platform") ?? "gumroad"),
      incomeGoal: String(form.get("incomeGoal") ?? "first-100"),
    };
    dlToolStart("product-blueprint-generator");
    const bp = generateBlueprint(input);
    setResult(bp);
    dlToolComplete("product-blueprint-generator", { goal: input.incomeGoal });
    setBusy(false);
    setTimeout(() => document.getElementById("bp-result")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-14 sm:pt-20 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Package className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free tool
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight">
            AI Product <span className="text-gradient">Blueprint Generator</span>
          </h1>
          <p className="mt-3 mx-auto max-w-xl text-muted-foreground">
            Your skills, time and budget in — three realistic product ideas, a 7-day plan, price and funnel out.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 sm:px-6 pb-8">
        <form onSubmit={run} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label htmlFor="skills" className="text-sm font-medium">What are your skills, interests or work experience?</label>
            <input id="skills" name="skills" required placeholder="e.g. I write emails, I know spreadsheets, I managed a restaurant" className={`${inputClass} mt-2`} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hoursPerWeek" className="text-sm font-medium">Time you can invest weekly</label>
              <select id="hoursPerWeek" name="hoursPerWeek" className={`${inputClass} mt-2`}>
                <option value="under-5">Under 5 hours</option>
                <option value="5-10" selected>5–10 hours</option>
                <option value="10-20">10–20 hours</option>
                <option value="20-plus">20+ hours</option>
              </select>
            </div>
            <div>
              <label htmlFor="budget" className="text-sm font-medium">Starting budget</label>
              <select id="budget" name="budget" className={`${inputClass} mt-2`}>
                <option value="0" selected>$0</option>
                <option value="under-100">Under $100</option>
                <option value="100-500">$100–$500</option>
                <option value="500-plus">$500+</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="platform" className="text-sm font-medium">Where would you sell?</label>
              <select id="platform" name="platform" className={`${inputClass} mt-2`}>
                <option value="gumroad" selected>Gumroad</option>
                <option value="stan">Stan</option>
                <option value="lovable">My own site</option>
                <option value="etsy">Etsy</option>
                <option value="other">Not sure yet</option>
              </select>
            </div>
            <div>
              <label htmlFor="incomeGoal" className="text-sm font-medium">First income goal</label>
              <select id="incomeGoal" name="incomeGoal" className={`${inputClass} mt-2`}>
                <option value="first-100" selected>First $100</option>
                <option value="1k-month">$1,000/month</option>
                <option value="5k-month">$5,000/month</option>
              </select>
            </div>
          </div>
          <Button type="submit" variant="brand" className="w-full h-12" disabled={busy}>
            <Sparkles className="h-4 w-4" /> Generate my blueprint
          </Button>
        </form>
      </section>

      {result && (
        <section id="bp-result" className="mx-auto max-w-3xl px-4 sm:px-6 pb-8 space-y-6">
          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Three realistic opportunities</p>
            <div className="mt-4 space-y-4">
              {result.opportunities.map((o, i) => (
                <div key={o.name} className={`rounded-xl p-4 ${i === 0 ? "glass-strong ring-1 ring-[color:var(--brand)]/40" : "glass"}`}>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h3 className="font-semibold">{i === 0 ? "★ " : ""}{o.name}</h3>
                    <span className="text-xs text-muted-foreground">{o.priceRange} · first sale in {o.timeToFirstDollar}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{o.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm"><span className="text-[color:var(--brand)] font-semibold">Why the first one: </span>{result.recommended.reasoning}</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Your 7-day plan</p>
            <ol className="mt-4 space-y-3">
              {result.sevenDayPlan.map((d) => (
                <li key={d.day} className="flex gap-3 text-sm">
                  <span className="shrink-0 font-semibold text-[color:var(--brand)] w-12">{d.day}</span>
                  <span className="text-foreground/85">{d.task}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Product outline</p>
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
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Price & offer</p>
            <p className="mt-3 text-2xl font-black text-[color:var(--brand)]">{result.priceOffer.price}</p>
            <p className="mt-1 text-sm text-muted-foreground">{result.priceOffer.offer}</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">The sales funnel</p>
            <div className="mt-4 space-y-3">
              {result.funnel.map((f) => (
                <div key={f.stage} className="text-sm">
                  <span className="font-semibold text-[color:var(--brand-2)]">{f.stage}: </span>
                  <span className="text-foreground/85">{f.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Launch content, ready to copy</p>
            <div className="mt-4 space-y-4">
              {result.launchContent.map((c) => (
                <div key={c.type}>
                  <p className="text-xs font-semibold text-[color:var(--brand-2)]">{c.type}</p>
                  <p className="mt-1 text-sm text-foreground/85">{c.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ShareResultButton
              toolSlug="product-blueprint-generator"
              title="My AI Product Blueprint"
              text="I generated a free digital-product blueprint (ideas, 7-day plan, pricing and funnel) — make yours free:"
            />
            <Button variant="glass" className="h-11 px-5" onClick={() => { dlToolCtaClick("product-blueprint-generator", { location: "regenerate" }); setResult(null); }}>
              Start over
            </Button>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <TryAnotherTools exclude="product-blueprint-generator" />
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
          <h2 className="text-2xl font-bold">Ready to build the systems behind the products?</h2>
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
