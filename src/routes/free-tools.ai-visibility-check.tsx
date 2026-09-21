import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Copy, Info, Loader2, Radar, Sparkles, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShareResultButton, TryAnotherTools } from "@/components/free-tools/tool-cards";
import { ogImageMeta } from "@/lib/og";
import {
  dlToolComplete,
  dlToolCtaClick,
  dlToolEmailCapture,
  dlToolStart,
  readUtm,
} from "@/lib/free-tools";
import {
  generateVisibilityFixList,
  runVisibilityCheck,
  submitToolLead,
  type VisibilityFixList,
  type VisibilityResult,
} from "@/lib/tool-leads.functions";

const SLUG = "ai-visibility-check";
const TITLE = "AI Search Visibility Check";
const DESC =
  "Free check: when customers ask ChatGPT for a business like yours, do you show up? We ask an AI model five real customer questions and show you who it names.";
const URL = "https://ai-income-systems.com/free-tools/ai-visibility-check";
const SNAPSHOT_NOTE =
  "A snapshot from one AI model at one moment — results vary by model, location, and time.";

const CATEGORIES = [
  "Roofing",
  "Plumbing",
  "HVAC",
  "Electrician",
  "Landscaping",
  "Cleaning service",
  "Salon or barber",
  "Restaurant or café",
  "Real estate agent",
  "Dentist or medical practice",
  "Law firm",
  "Accountant or bookkeeper",
  "Gym or personal trainer",
  "Photographer",
  "Marketing agency",
  "Coach or consultant",
  "E-commerce store",
  "Other",
];

const FAQS = [
  {
    q: "How does this check work?",
    a: "We generate five realistic questions a customer would ask an AI assistant to find a business like yours, ask an AI model each one, and check whether your name or domain shows up in the answers.",
  },
  {
    q: "Is a low score bad news?",
    a: "Not on its own. AI answers shift by model, location and phrasing, and most small businesses score zero at first. It's a starting point, not a verdict.",
  },
  {
    q: "Why only five questions?",
    a: "Each check runs several live model queries. Five keeps it fast, free and honest about being a snapshot rather than a full audit.",
  },
  {
    q: "What's in the emailed fix list?",
    a: "Seven specific actions — Google Business Profile, reviews, site FAQs, schema markup, consistent listings, question-led blog posts and local mentions — each with a copy-paste prompt tailored to your business.",
  },
];

export const Route = createFileRoute("/free-tools/ai-visibility-check")({
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
  component: VisibilityCheckPage,
});

function PromptBlock({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-widest text-[color:var(--brand-2)]">Copy-paste prompt</p>
        <Button
          variant="glass"
          className="h-7 px-2 text-xs"
          onClick={() => {
            void navigator.clipboard?.writeText(prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground">{prompt}</p>
    </div>
  );
}

function VisibilityCheckPage() {
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [competitorA, setCompetitorA] = useState("");
  const [competitorB, setCompetitorB] = useState("");

  const [checkState, setCheckState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<VisibilityResult | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [leadState, setLeadState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [leadError, setLeadError] = useState<string | null>(null);
  const [fixList, setFixList] = useState<VisibilityFixList | null>(null);

  const doCheck = useServerFn(runVisibilityCheck);
  const saveLead = useServerFn(submitToolLead);
  const makeFixList = useServerFn(generateVisibilityFixList);

  const competitors = useMemo(
    () => [competitorA, competitorB].map((c) => c.trim()).filter(Boolean),
    [competitorA, competitorB],
  );

  const othersNamed = useMemo(() => {
    if (!result) return [] as string[];
    const seen = new Set<string>();
    for (const q of result.questions) {
      for (const n of q.businesses_named) {
        const clean = n.trim();
        if (clean && clean.toLowerCase() !== businessName.trim().toLowerCase()) seen.add(clean);
      }
    }
    return Array.from(seen).slice(0, 12);
  }, [result, businessName]);

  const runCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    dlToolStart(SLUG);
    setCheckState("running");
    setCheckError(null);
    setFixList(null);
    setLeadState("idle");
    try {
      const res = await doCheck({
        data: {
          business_name: businessName.trim(),
          website: website.trim() || undefined,
          city: city.trim() || undefined,
          category,
          competitors,
        },
      });
      setResult(res);
      setCheckState("done");
      dlToolComplete(SLUG, { score: res.score });
    } catch (err) {
      setCheckState("error");
      setCheckError((err as Error).message || "The check couldn't finish. Try again in a moment.");
    }
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    setLeadState("loading");
    setLeadError(null);
    const utm = readUtm();
    const summary = `Scored ${result.score}/5 for "${category}"${city ? ` in ${city}` : ""}. ${
      othersNamed.length ? `Named instead: ${othersNamed.slice(0, 5).join(", ")}.` : "No businesses named."
    }`;
    try {
      await saveLead({
        data: {
          email,
          first_name: firstName || undefined,
          tool_slug: SLUG,
          business_type: category,
          answers: {
            business_name: businessName,
            website,
            city,
            category,
            competitors: competitors.join(", "),
            questions: result.questions.map((q) => `${q.mentioned ? "HIT" : "MISS"}: ${q.question}`).join(" | "),
          },
          score: result.score * 20,
          result_summary: summary,
          company,
          ...utm,
        },
      });
      dlToolEmailCapture(SLUG, { score: result.score });
      const list = await makeFixList({
        data: {
          business_name: businessName.trim(),
          website: website.trim() || undefined,
          city: city.trim() || undefined,
          category,
          score: result.score,
          questions: result.questions.map((q) => ({ question: q.question, mentioned: q.mentioned })),
          competitors_seen: othersNamed,
        },
      });
      setFixList(list);
      setLeadState("done");
    } catch (err) {
      setLeadState("error");
      setLeadError((err as Error).message || "Something went wrong. Try again in a moment.");
    }
  };

  const scoreLine =
    result == null
      ? ""
      : result.score === 0
        ? "The model didn't name you once. That's normal — and fixable."
        : result.score >= 4
          ? "You're showing up in most of these answers. Keep feeding the machine."
          : "You're showing up sometimes. There's room to be the obvious answer.";

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-14 sm:pt-20 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Radar className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free tool · about 60 seconds
          </div>
          <h1 className="mt-5 text-3xl sm:text-5xl font-black tracking-tight">
            AI Search <span className="text-gradient">Visibility Check</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            When customers ask ChatGPT for a business like yours, do you show up?
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        {/* Form */}
        <form onSubmit={runCheck} className="glass-strong rounded-3xl p-5 sm:p-7 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium" htmlFor="biz">
                Business name
              </label>
              <Input
                id="biz"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Miller & Sons Roofing"
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="site">
                Website
              </label>
              <Input
                id="site"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="millerroofing.com"
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="city">
                City or area <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Phoenix, AZ"
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="cat">
                Business category
              </label>
              <select
                id="cat"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm"
              >
                <option value="">Choose one…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium" htmlFor="c1">
                Competitor <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="c1"
                value={competitorA}
                onChange={(e) => setCompetitorA(e.target.value)}
                placeholder="A rival you'd hate to lose to"
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="c2">
                Another competitor <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="c2"
                value={competitorB}
                onChange={(e) => setCompetitorB(e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
          </div>

          <Button type="submit" variant="brand" size="lg" className="h-12 mt-1" disabled={checkState === "running"}>
            {checkState === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
            {checkState === "running" ? "Asking the model…" : "Run my visibility check"}
          </Button>
          <p className="text-xs text-muted-foreground inline-flex items-start gap-1.5">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {SNAPSHOT_NOTE}
          </p>
          {checkError && <p className="text-sm text-red-300">{checkError}</p>}
        </form>

        {/* Result */}
        {result && (
          <div className="glass-strong rounded-3xl p-5 sm:p-7 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="shrink-0 grid place-items-center h-24 w-24 rounded-2xl glass">
                <p className="text-3xl font-black text-gradient tabular-nums">{result.score}/5</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">mentions</p>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold">{scoreLine}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{SNAPSHOT_NOTE}</p>
                {result.cached && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Showing a saved result from the last 7 days for this business and area.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {result.questions.map((q) => (
                <div key={q.question} className="glass rounded-2xl p-4">
                  <div className="flex items-start gap-2.5">
                    {q.mentioned ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--success)]" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium break-words">“{q.question}”</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {q.mentioned ? "You were named in the answer." : "You weren't named in the answer."}
                      </p>
                      {q.businesses_named.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {q.businesses_named.map((n) => (
                            <span
                              key={n}
                              className={`rounded-full glass px-2 py-0.5 text-[11px] ${
                                q.competitors_named.includes(n) ? "text-[color:var(--brand-2)]" : "text-muted-foreground"
                              }`}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {othersNamed.length > 0 && (
              <div className="mt-5 glass rounded-2xl p-4">
                <p className="text-sm font-semibold">Named instead of you</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {othersNamed.map((n) => (
                    <span key={n} className="rounded-full glass px-2 py-0.5 text-[11px] text-muted-foreground">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5">
              <ShareResultButton
                toolSlug={SLUG}
                title="My AI visibility score"
                text={`An AI model named my business in ${result.score} of 5 real customer questions.`}
              />
            </div>
          </div>
        )}

        {/* Email gate */}
        {result && !fixList && (
          <div className="glass rounded-3xl p-5 sm:p-8 mt-6">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> AI Visibility Fix List
            </div>
            <h3 className="mt-3 text-xl font-bold">Get your 7-step fix list</h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
              Seven specific actions — profile, reviews, site FAQs, schema, listings, question-led posts and local
              mentions — each with a copy-paste prompt written for your business.
            </p>
            <form onSubmit={submitEmail} className="mt-5 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                placeholder="First name (optional)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-11"
                disabled={leadState === "loading"}
              />
              <Input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                disabled={leadState === "loading"}
              />
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="hidden"
              />
              <Button
                type="submit"
                variant="brand"
                className="h-11 px-5 whitespace-nowrap"
                disabled={leadState === "loading"}
              >
                {leadState === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {leadState === "loading" ? "Writing it…" : "Email me my fix list"}
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              No spam, unsubscribe in one click. We never sell your email.
            </p>
            {leadError && <p className="mt-3 text-sm text-red-300">{leadError}</p>}
          </div>
        )}

        {/* Fix list */}
        {fixList && (
          <div className="glass-strong rounded-3xl p-5 sm:p-8 mt-6">
            <p className="inline-flex items-center gap-2 text-xs text-[color:var(--success)]">
              <Check className="h-3.5 w-3.5" /> Fix list ready — a copy is on its way to your inbox.
            </p>
            <h3 className="mt-3 text-2xl font-bold">{fixList.headline}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{fixList.summary}</p>

            <div className="mt-6 space-y-4">
              {fixList.actions.map((a) => (
                <div key={a.rank} className="glass rounded-2xl p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--brand)]/20 text-xs font-bold">
                      {a.rank}
                    </span>
                    <span className="font-semibold">{a.title}</span>
                    <span className="rounded-full glass px-2 py-0.5 text-[11px] text-muted-foreground">{a.area}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{a.why}</p>
                  <ol className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    {a.steps.map((s, i) => (
                      <li key={s} className="flex gap-2">
                        <span className="shrink-0 tabular-nums text-foreground/60">{i + 1}.</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                  <PromptBlock prompt={a.prompt} />
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-muted-foreground">{SNAPSHOT_NOTE}</p>
          </div>
        )}

        {/* CTA */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8 mt-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h3 className="text-xl sm:text-2xl font-bold">Build the content engine that fixes this</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            Showing up in AI answers comes down to publishing the answers customers actually ask for. Start with the
            free guide, then use the Builder tier if you want the workflows that keep it running.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              variant="brand"
              className="h-12 px-7"
              onClick={() => dlToolCtaClick(SLUG, { location: "result-cta", target: "guide" })}
            >
              <Link to="/guides/$slug" params={{ slug: "ai-content-system" }}>
                Read The AI Content System <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="glass"
              className="h-12 px-7"
              onClick={() => dlToolCtaClick(SLUG, { location: "result-cta", target_tier: "builder" })}
            >
              <Link to="/pricing">See Builder pricing</Link>
            </Button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-center">Questions people ask</h2>
          <div className="mt-6 space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="glass rounded-2xl p-5">
                <p className="font-semibold">{f.q}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <TryAnotherTools exclude={SLUG} />
      </section>

      <SiteFooter />
    </div>
  );
}
