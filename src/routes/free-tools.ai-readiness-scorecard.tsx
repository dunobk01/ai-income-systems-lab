import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowLeft, Gauge, Loader2, Check, Sparkles, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShareResultButton, TryAnotherTools } from "@/components/free-tools/tool-cards";
import { ogImageMeta } from "@/lib/og";
import {
  BUSINESS_TYPES,
  QUESTIONS,
  TEAM_SIZES,
  ctaTierFor,
  scoreFor,
  tierFor,
  topOpportunity,
  type Answers,
} from "@/lib/scorecard-data";
import {
  dlToolComplete,
  dlToolCtaClick,
  dlToolEmailCapture,
  dlToolStart,
  readUtm,
} from "@/lib/free-tools";
import {
  attachToolReport,
  generateScorecardReport,
  reportUrlFor,
  submitToolLead,
  type ScorecardReport,
} from "@/lib/tool-leads.functions";

const SLUG = "ai-readiness-scorecard";
const TITLE = "AI Readiness Scorecard for Small Businesses";
const DESC =
  "Free 2-minute AI readiness scorecard. Answer 10 questions and find where AI can save your business the most time — plus what to automate first. No signup to see your score.";
const URL = "https://ai-income-systems.com/free-tools/ai-readiness-scorecard";

const FAQS = [
  { q: "How long does the scorecard take?", a: "About two minutes. Ten multiple-choice questions, one screen at a time." },
  { q: "Do I need an account to see my score?", a: "No. Your score and your top automation opportunity appear straight away. Email is only for the full report." },
  { q: "How is the score calculated?", a: "Each answer carries a weight based on how much of that area still runs manually. The weights are added up and scaled to 100." },
  { q: "Is the hours-saved number a guarantee?", a: "No — it's an estimate based on typical small businesses in that situation, and it's labelled as one. Your mileage will vary." },
];

export const Route = createFileRoute("/free-tools/ai-readiness-scorecard")({
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
  component: ScorecardPage,
});

function Gauge100({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-white/10" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-black">{pct}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">/ 100</div>
        </div>
      </div>
    </div>
  );
}

function ScorecardPage() {
  const [step, setStep] = useState(0); // 0 = intro, 1..10 = questions, 11 = result
  const [businessType, setBusinessType] = useState<string>("");
  const [teamSize, setTeamSize] = useState<string>("");
  const [answers, setAnswers] = useState<Answers>({});
  const [started, setStarted] = useState(false);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [emailState, setEmailState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [report, setReport] = useState<ScorecardReport | null>(null);

  const [reportUrl, setReportUrl] = useState<string | undefined>(undefined);

  const saveLead = useServerFn(submitToolLead);
  const persistReport = useServerFn(attachToolReport);
  const makeReport = useServerFn(generateScorecardReport);

  const total = QUESTIONS.length;
  const isResult = step > total;
  const score = useMemo(() => scoreFor(answers), [answers]);
  const tier = useMemo(() => tierFor(score), [score]);
  const opportunity = useMemo(() => topOpportunity(answers), [answers]);
  const ctaTier = useMemo(() => ctaTierFor(score, answers), [score, answers]);

  useEffect(() => {
    if (isResult) dlToolComplete(SLUG, { score, tier: tier.key, business_type: businessType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResult]);

  const begin = () => {
    if (!businessType || !teamSize) return;
    if (!started) {
      dlToolStart(SLUG, { business_type: businessType, team_size: teamSize });
      setStarted(true);
    }
    setStep(1);
  };

  const choose = (qid: string, value: string) => {
    setAnswers((a) => ({ ...a, [qid]: value }));
    setTimeout(() => setStep((s) => s + 1), 140);
  };

  const answerSummary = () =>
    QUESTIONS.filter((q) => answers[q.id]).map(
      (q) => `${q.area}: ${q.options.find((o) => o.value === answers[q.id])?.label ?? ""}`,
    );

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailState("loading");
    setEmailError(null);
    const utm = readUtm();
    const summary = `${score}/100 — ${tier.label}. Top opportunity: ${opportunity?.title ?? "n/a"}.`;
    try {
      const saved = await saveLead({
        data: {
          email,
          first_name: firstName || undefined,
          tool_slug: SLUG,
          business_type: businessType,
          answers: { ...answers, team_size: teamSize },
          score,
          result_summary: summary,
          company,
          ...utm,
        },
      });
      dlToolEmailCapture(SLUG, { score, business_type: businessType });
      const generated = await makeReport({
        data: {
          business_type: BUSINESS_TYPES.find((b) => b.value === businessType)?.label ?? businessType,
          team_size: TEAM_SIZES.find((t) => t.value === teamSize)?.label ?? teamSize,
          score,
          tier_label: tier.label,
          answers,
          answer_summary: answerSummary(),
        },
      });
      setReport(generated);
      if (saved.report_token) {
        setReportUrl(reportUrlFor(saved.report_token));
        void persistReport({
          data: { report_token: saved.report_token, report: generated as unknown as Record<string, unknown> },
        });
      }
      setEmailState("done");
    } catch (err) {
      setEmailState("error");
      setEmailError((err as Error).message || "Something went wrong. Try again in a moment.");
    }
  };

  const progress = Math.round(((step - 1) / total) * 100);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-14 sm:pt-20 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Gauge className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free tool · about 2 minutes
          </div>
          <h1 className="mt-5 text-3xl sm:text-5xl font-black tracking-tight">
            AI Readiness <span className="text-gradient">Scorecard</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Find where AI can save your business the most time — and what to automate first.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        {/* Step 0 — profile */}
        {step === 0 && (
          <div className="glass-strong rounded-3xl p-5 sm:p-8">
            <h2 className="text-lg font-semibold">First, the basics</h2>
            <p className="mt-1 text-sm text-muted-foreground">Two taps, then ten questions.</p>

            <p className="mt-6 text-sm font-medium">What kind of business is it?</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {BUSINESS_TYPES.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setBusinessType(b.value)}
                  className={`text-left rounded-xl border px-4 py-3 text-sm transition ${
                    businessType === b.value
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)]/10"
                      : "border-white/10 hover:border-white/25 hover:bg-white/5"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <p className="mt-6 text-sm font-medium">How big is the team?</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TEAM_SIZES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTeamSize(t.value)}
                  className={`rounded-xl border px-4 py-3 text-sm transition ${
                    teamSize === t.value
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)]/10"
                      : "border-white/10 hover:border-white/25 hover:bg-white/5"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <Button
              variant="brand"
              className="mt-7 h-12 w-full sm:w-auto px-7"
              disabled={!businessType || !teamSize}
              onClick={begin}
            >
              Start the scorecard <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Steps 1..10 — questions */}
        {step >= 1 && step <= total && (
          <div className="glass-strong rounded-3xl p-5 sm:p-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Question {step} of {total}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.max(progress, 4)}%`, background: "var(--gradient-brand, var(--brand))" }}
              />
            </div>

            {(() => {
              const q = QUESTIONS[step - 1]!;
              return (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold leading-snug">{q.question}</h2>
                  <div className="mt-4 grid gap-2">
                    {q.options.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => choose(q.id, o.value)}
                        className={`text-left rounded-xl border px-4 py-3.5 text-sm transition ${
                          answers[q.id] === o.value
                            ? "border-[color:var(--brand)] bg-[color:var(--brand)]/10"
                            : "border-white/10 hover:border-white/25 hover:bg-white/5"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="mt-6 flex items-center justify-between">
              <Button variant="ghost" className="h-10" onClick={() => setStep((s) => Math.max(0, s - 1))}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              {answers[QUESTIONS[step - 1]!.id] && (
                <Button variant="glass" className="h-10" onClick={() => setStep((s) => s + 1)}>
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {isResult && (
          <div className="space-y-6">
            <div className="glass-strong rounded-3xl p-5 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 -z-10 opacity-50" style={{ background: "var(--gradient-hero)" }} />
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <Gauge100 score={score} />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Your readiness tier</p>
                  <h2 className="mt-1 text-2xl font-bold leading-tight">{tier.label}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{tier.blurb}</p>
                </div>
              </div>

              {opportunity && (
                <div className="mt-6 rounded-2xl border border-[color:var(--brand-2)]/30 bg-[color:var(--brand-2)]/5 p-5">
                  <p className="text-xs uppercase tracking-widest text-[color:var(--brand-2)]">
                    Your #1 automation opportunity
                  </p>
                  <h3 className="mt-1.5 text-lg font-semibold">{opportunity.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{opportunity.detail}</p>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm">
                    <Clock className="h-4 w-4 text-[color:var(--brand-2)]" />
                    <span className="font-semibold">~{opportunity.hours} hours/week</span>
                    <span className="text-muted-foreground">back — an estimate, not a promise.</span>
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                <ShareResultButton
                  toolSlug={SLUG}
                  title="My AI Readiness Score"
                  text={`I scored ${score}/100 on the AI Readiness Scorecard: ${tier.label}.`}
                  url={reportUrl}
                />
                <Button variant="ghost" className="h-11" onClick={() => { setStep(0); setAnswers({}); setReport(null); setEmailState("idle"); }}>
                  Retake it
                </Button>
              </div>
            </div>

            {/* Email gate */}
            {emailState !== "done" && (
              <div className="glass rounded-3xl p-5 sm:p-8">
                <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Full report
                </div>
                <h3 className="mt-3 text-xl font-bold">Get your full personalised report</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Your top 3 automations ranked by impact vs effort, which tool to use for each, a 30-day starter plan,
                  and 3 copy-paste prompts written for a {BUSINESS_TYPES.find((b) => b.value === businessType)?.label.toLowerCase() ?? "small"} business.
                </p>
                <form onSubmit={submitEmail} className="mt-5 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <Input
                    placeholder="First name (optional)"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-11"
                    disabled={emailState === "loading"}
                  />
                  <Input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    disabled={emailState === "loading"}
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
                  <Button type="submit" variant="brand" className="h-11 px-5 whitespace-nowrap" disabled={emailState === "loading"}>
                    {emailState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {emailState === "loading" ? "Writing it…" : "Email me my full report"}
                  </Button>
                </form>
                <p className="mt-2 text-xs text-muted-foreground">No spam, unsubscribe in one click. We never sell your email.</p>
                {emailError && <p className="mt-3 text-sm text-red-300">{emailError}</p>}
              </div>
            )}

            {/* Generated report */}
            {report && (
              <div className="glass-strong rounded-3xl p-5 sm:p-8">
                <p className="inline-flex items-center gap-2 text-xs text-[color:var(--success)]">
                  <Check className="h-3.5 w-3.5" /> Report ready — it is right below, and a copy is on its way to your inbox.
                </p>
                <h3 className="mt-3 text-2xl font-bold">{report.headline}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{report.summary}</p>

                <h4 className="mt-8 text-sm uppercase tracking-[0.2em] text-muted-foreground">Top 3 automations</h4>
                <div className="mt-3 space-y-3">
                  {report.automations.map((a) => (
                    <div key={a.rank} className="glass rounded-2xl p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--brand)]/20 text-xs font-bold">
                          {a.rank}
                        </span>
                        <span className="font-semibold">{a.title}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        <span className="rounded-full glass px-2 py-0.5">Impact: {a.impact}</span>
                        <span className="rounded-full glass px-2 py-0.5">Effort: {a.effort}</span>
                        {a.tools.map((t) => (
                          <span key={t} className="rounded-full glass px-2 py-0.5 text-[color:var(--brand-2)]">{t}</span>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{a.why}</p>
                    </div>
                  ))}
                </div>

                <h4 className="mt-8 text-sm uppercase tracking-[0.2em] text-muted-foreground">Your 30-day starter plan</h4>
                <div className="mt-3 space-y-3">
                  {report.plan.map((p) => (
                    <div key={p.window} className="glass rounded-2xl p-5">
                      <p className="text-xs uppercase tracking-widest text-[color:var(--brand-2)]">{p.window}</p>
                      <p className="mt-1 font-semibold">{p.focus}</p>
                      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                        {p.actions.map((act) => (
                          <li key={act} className="flex gap-2">
                            <Check className="h-4 w-4 shrink-0 text-[color:var(--brand-2)] mt-0.5" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <h4 className="mt-8 text-sm uppercase tracking-[0.2em] text-muted-foreground">Copy-paste prompts</h4>
                <div className="mt-3 space-y-3">
                  {report.prompts.map((p) => (
                    <div key={p.title} className="glass rounded-2xl p-5">
                      <p className="font-semibold">{p.title}</p>
                      <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground font-mono leading-relaxed">
                        {p.prompt}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mapped CTA */}
            <div className="glass-strong rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
              <h3 className="text-xl sm:text-2xl font-bold">{tier.cta.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {ctaTier === "accelerator"
                  ? "Your answers point at customer-facing automation — the Chatbot Agency module is built for exactly that."
                  : ctaTier === "builder"
                    ? "You need the glue: n8n templates and the builders that connect what you already use."
                    : "Start at the beginning — the first modules get the manual work out of your head and into a system."}
              </p>
              <Button
                asChild
                size="lg"
                variant="brand"
                className="mt-5 h-12 px-7"
                onClick={() => dlToolCtaClick(SLUG, { location: "result-cta", target_tier: ctaTier })}
              >
                <Link to="/pricing">See pricing <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>

            <TryAnotherTools exclude={SLUG} />
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
