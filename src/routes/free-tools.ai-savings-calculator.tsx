import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Calculator,
  Check,
  Download,
  Info,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShareResultButton, TryAnotherTools } from "@/components/free-tools/tool-cards";
import { ogImageMeta } from "@/lib/og";
import {
  CUSTOM_AUTOMATION,
  CUSTOM_RATIONALE,
  MAX_HOURS,
  TASKS,
  computeSavings,
  money,
  type TaskInput,
} from "@/lib/savings-calculator-data";
import {
  dlToolComplete,
  dlToolCtaClick,
  dlToolEmailCapture,
  dlToolStart,
  readUtm,
} from "@/lib/free-tools";
import {
  generateSavingsBlueprint,
  submitToolLead,
  attachToolReport,
  reportUrlFor,
  type SavingsBlueprint,
} from "@/lib/tool-leads.functions";
import { downloadBlueprintPdf } from "@/lib/savings-pdf";

const SLUG = "ai-savings-calculator";
const TITLE = "AI Time & Money Savings Calculator";
const DESC =
  "Free calculator: see how many hours and dollars AI could give back to you every month. Move the sliders for the work that eats your week and get an instant, conservative estimate.";
const URL = "https://ai-income-systems.com/free-tools/ai-savings-calculator";
const DISCLAIMER = "Estimates only. Your mileage will vary depending on how much you actually implement.";

const FAQS = [
  {
    q: "Where do the automation percentages come from?",
    a: "They're deliberately conservative ranges (roughly 30–60%) based on what a well-built automation typically removes from each task. Every percentage is shown on screen with the reasoning behind it.",
  },
  {
    q: "Is this a prediction of how much I'll save?",
    a: "No. It's an estimate based on the hours you enter. Nothing saves you time until it's actually built and used.",
  },
  { q: "Do I need an account?", a: "No. The numbers and chart are free. Email is only for the automation blueprint PDF." },
  {
    q: "What's in the emailed blueprint?",
    a: "The three tasks worth automating first, each as a concrete n8n workflow — trigger, steps and output — plus honest caveats. It downloads as a branded PDF.",
  },
];

export const Route = createFileRoute("/free-tools/ai-savings-calculator")({
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
  component: SavingsCalculatorPage,
});

type CustomTask = { id: string; label: string; hours: number };

function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="How this estimate is calculated"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className="text-muted-foreground hover:text-foreground"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span className="absolute left-1/2 top-6 z-30 w-56 -translate-x-1/2 rounded-xl glass-strong p-3 text-xs leading-relaxed text-muted-foreground shadow-xl">
          {text}
        </span>
      )}
    </span>
  );
}

/** Lightweight horizontal bar chart — readable down to 375px. */
function SavingsChart({ rows }: { rows: Array<{ label: string; savedHours: number; savedMoney: number }> }) {
  const visible = rows.filter((r) => r.savedHours > 0).sort((a, b) => b.savedHours - a.savedHours);
  const max = Math.max(...visible.map((r) => r.savedHours), 0.01);
  if (!visible.length) {
    return <p className="text-sm text-muted-foreground">Move a slider above to see where the hours go.</p>;
  }
  return (
    <div className="space-y-3">
      {visible.map((r) => (
        <div key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate text-foreground/90">{r.label}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {r.savedHours.toFixed(1)}h · {money(r.savedMoney)}/mo
            </span>
          </div>
          <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.max((r.savedHours / max) * 100, 3)}%`, background: "var(--gradient-brand)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SavingsCalculatorPage() {
  const [rate, setRate] = useState(50);
  const [hoursById, setHoursById] = useState<Record<string, number>>(
    Object.fromEntries(TASKS.map((t) => [t.id, t.defaultHours])),
  );
  const [customs, setCustoms] = useState<CustomTask[]>([]);
  const started = useRef(false);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<SavingsBlueprint | null>(null);

  const [reportUrl, setReportUrl] = useState<string | undefined>(undefined);

  const saveLead = useServerFn(submitToolLead);
  const persistReport = useServerFn(attachToolReport);
  const makeBlueprint = useServerFn(generateSavingsBlueprint);

  const taskInputs: TaskInput[] = useMemo(
    () => [
      ...TASKS.map((t) => ({ id: t.id, label: t.label, hours: hoursById[t.id] ?? 0, automation: t.automation })),
      ...customs.map((c) => ({
        id: c.id,
        label: c.label.trim() || "Custom task",
        hours: c.hours,
        automation: CUSTOM_AUTOMATION,
      })),
    ],
    [hoursById, customs],
  );

  const savings = useMemo(() => computeSavings(taskInputs, rate), [taskInputs, rate]);

  const markStarted = () => {
    if (started.current) return;
    started.current = true;
    dlToolStart(SLUG);
  };

  const setHours = (id: string, v: number) => {
    markStarted();
    setHoursById((h) => ({ ...h, [id]: v }));
  };

  const addCustom = () => {
    markStarted();
    setCustoms((c) => (c.length >= 2 ? c : [...c, { id: `custom-${Date.now()}`, label: "", hours: 2 }]));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setError(null);
    const utm = readUtm();
    const topTasks = savings.perTask
      .filter((t) => t.savedHours > 0)
      .sort((a, b) => b.savedHours - a.savedHours)
      .slice(0, 8);
    const summary = `${savings.hoursWeek.toFixed(1)}h/week saved · ${money(savings.moneyMonth)}/month · ${money(
      savings.moneyYear,
    )}/year at ${money(rate)}/hour.`;
    try {
      const saved = await saveLead({
        data: {
          email,
          first_name: firstName || undefined,
          tool_slug: SLUG,
          answers: {
            hourly_rate: String(rate),
            hours_week_saved: savings.hoursWeek.toFixed(2),
            money_month_saved: savings.moneyMonth.toFixed(0),
            ...Object.fromEntries(taskInputs.map((t) => [t.label, String(t.hours)])),
          },
          score: Math.min(100, Math.round(savings.hoursWeek)),
          result_summary: summary,
          company,
          ...utm,
        },
      });
      dlToolEmailCapture(SLUG, { hours_week_saved: Number(savings.hoursWeek.toFixed(1)) });
      const bp = await makeBlueprint({
        data: {
          hourly_rate: rate,
          hours_week_saved: Number(savings.hoursWeek.toFixed(2)),
          money_month_saved: Number(savings.moneyMonth.toFixed(0)),
          top_tasks: topTasks.map((t) => ({ label: t.label, hours: t.hours, saved_hours: t.savedHours })),
        },
      });
      setBlueprint(bp);
      if (saved.report_token) {
        setReportUrl(reportUrlFor(saved.report_token));
        void persistReport({
          data: { report_token: saved.report_token, report: bp as unknown as Record<string, unknown> },
        });
      }
      setState("done");
      dlToolComplete(SLUG, { hours_week_saved: Number(savings.hoursWeek.toFixed(1)) });
    } catch (err) {
      setState("error");
      setError((err as Error).message || "Something went wrong. Try again in a moment.");
    }
  };

  const stats = [
    { label: "Hours / week", value: savings.hoursWeek.toFixed(1) },
    { label: "Hours / month", value: savings.hoursMonth.toFixed(0) },
    { label: "Value / month", value: money(savings.moneyMonth) },
    { label: "Value / year", value: money(savings.moneyYear) },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-14 sm:pt-20 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Calculator className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free tool · about 90 seconds
          </div>
          <h1 className="mt-5 text-3xl sm:text-5xl font-black tracking-tight">
            AI Time &amp; Money <span className="text-gradient">Savings Calculator</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            See how many hours and dollars AI could give back to you every month.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
          {/* Inputs */}
          <div className="glass-strong rounded-3xl p-5 sm:p-7">
            <label className="block text-sm font-medium" htmlFor="rate">
              What's an hour of your time worth?
            </label>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                id="rate"
                type="number"
                min={1}
                max={2000}
                value={rate}
                onChange={(e) => {
                  markStarted();
                  setRate(Math.max(1, Math.min(2000, Number(e.target.value) || 0)));
                }}
                className="h-11 w-32"
              />
              <span className="text-sm text-muted-foreground">per hour</span>
            </div>

            <h2 className="mt-7 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Hours a week you spend on…
            </h2>

            <div className="mt-4 space-y-5">
              {TASKS.map((t) => {
                const h = hoursById[t.id] ?? 0;
                return (
                  <div key={t.id}>
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <span className="text-sm">{t.label}</span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                        <span className="text-foreground font-semibold">{h}h</span>
                        <span className="rounded-full glass px-2 py-0.5 text-[10px]">
                          {Math.round(t.automation * 100)}% automatable
                        </span>
                        <Tooltip text={`${t.rationale} This is an estimate, not a promise.`} />
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={MAX_HOURS}
                      step={0.5}
                      value={h}
                      aria-label={`${t.label} hours per week`}
                      onChange={(e) => setHours(t.id, Number(e.target.value))}
                      className="mt-2 w-full accent-[color:var(--brand)]"
                    />
                  </div>
                );
              })}

              {customs.map((c, i) => (
                <div key={c.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Input
                      placeholder={`Custom task ${i + 1}`}
                      value={c.label}
                      onChange={(e) =>
                        setCustoms((cs) => cs.map((x) => (x.id === c.id ? { ...x, label: e.target.value } : x)))
                      }
                      className="h-9 max-w-[60%]"
                    />
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                      <span className="text-foreground font-semibold">{c.hours}h</span>
                      <span className="rounded-full glass px-2 py-0.5 text-[10px]">
                        {Math.round(CUSTOM_AUTOMATION * 100)}% automatable
                      </span>
                      <Tooltip text={`${CUSTOM_RATIONALE} This is an estimate, not a promise.`} />
                      <button
                        type="button"
                        aria-label="Remove custom task"
                        onClick={() => setCustoms((cs) => cs.filter((x) => x.id !== c.id))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={MAX_HOURS}
                    step={0.5}
                    value={c.hours}
                    aria-label={`${c.label || "Custom task"} hours per week`}
                    onChange={(e) =>
                      setCustoms((cs) =>
                        cs.map((x) => (x.id === c.id ? { ...x, hours: Number(e.target.value) } : x)),
                      )
                    }
                    className="mt-2 w-full accent-[color:var(--brand)]"
                  />
                </div>
              ))}
            </div>

            {customs.length < 2 && (
              <Button variant="glass" className="mt-6 h-10" onClick={addCustom}>
                <Plus className="h-4 w-4" /> Add a custom task
              </Button>
            )}
          </div>

          {/* Results */}
          <div className="lg:sticky lg:top-20 space-y-4">
            <div className="glass-strong rounded-3xl p-5 sm:p-6 relative overflow-hidden">
              <div className="absolute inset-0 -z-10 opacity-50" style={{ background: "var(--gradient-hero)" }} />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">If you automated it</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="glass rounded-2xl p-3">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-xl sm:text-2xl font-black text-gradient tabular-nums break-words">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                You told us you spend {savings.totalHoursWeek.toFixed(1)} hours a week on this work.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{DISCLAIMER}</p>
              <div className="mt-4">
                <ShareResultButton
                  toolSlug={SLUG}
                  title="My AI savings estimate"
                  text={`The AI Savings Calculator says I could get back about ${savings.hoursWeek.toFixed(1)} hours a week.`}
                  url={reportUrl}
                />
              </div>
            </div>

            <div className="glass rounded-3xl p-5 sm:p-6">
              <p className="text-sm font-semibold">Where the savings come from</p>
              <div className="mt-4">
                <SavingsChart rows={savings.perTask} />
              </div>
            </div>
          </div>
        </div>

        {/* Email gate */}
        {state !== "done" && (
          <div className="glass rounded-3xl p-5 sm:p-8 mt-6">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Automation Blueprint
            </div>
            <h3 className="mt-3 text-xl font-bold">Get your Automation Blueprint</h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
              The three tasks worth automating first, each written up as a concrete n8n workflow — trigger, steps,
              output — plus honest caveats. Downloads as a branded PDF.
            </p>
            <form onSubmit={submit} className="mt-5 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                placeholder="First name (optional)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-11"
                disabled={state === "loading"}
              />
              <Input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                disabled={state === "loading"}
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
              <Button type="submit" variant="brand" className="h-11 px-5 whitespace-nowrap" disabled={state === "loading"}>
                {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {state === "loading" ? "Building it…" : "Email me my blueprint"}
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              No spam, unsubscribe in one click. We never sell your email.
            </p>
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          </div>
        )}

        {/* Blueprint */}
        {blueprint && (
          <div className="glass-strong rounded-3xl p-5 sm:p-8 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 text-xs text-[color:var(--success)]">
                  <Check className="h-3.5 w-3.5" /> Blueprint ready — it is right below, downloadable as a PDF, and on its way to your inbox.
                </p>
                <h3 className="mt-3 text-2xl font-bold">{blueprint.headline}</h3>
              </div>
              <Button
                variant="brand"
                className="h-11 whitespace-nowrap"
                onClick={() => {
                  dlToolCtaClick(SLUG, { location: "download-pdf" });
                  void downloadBlueprintPdf(blueprint, {
                    hoursWeek: savings.hoursWeek,
                    hoursMonth: savings.hoursMonth,
                    moneyMonth: savings.moneyMonth,
                    moneyYear: savings.moneyYear,
                    rate,
                  });
                }}
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{blueprint.summary}</p>

            <div className="mt-6 space-y-4">
              {blueprint.workflows.map((w) => (
                <div key={w.rank} className="glass rounded-2xl p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--brand)]/20 text-xs font-bold">
                      {w.rank}
                    </span>
                    <span className="font-semibold">{w.title}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded-full glass px-2 py-0.5">{w.task}</span>
                    {w.tools.map((t) => (
                      <span key={t} className="rounded-full glass px-2 py-0.5 text-[color:var(--brand-2)]">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{w.why}</p>
                  <div className="mt-4 rounded-xl border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-widest text-[color:var(--brand-2)]">Trigger</p>
                    <p className="mt-1 text-sm">{w.trigger}</p>
                    <p className="mt-3 text-xs uppercase tracking-widest text-[color:var(--brand-2)]">Steps</p>
                    <ol className="mt-1 space-y-1.5 text-sm text-muted-foreground">
                      {w.steps.map((s, i) => (
                        <li key={s} className="flex gap-2">
                          <span className="shrink-0 tabular-nums text-foreground/60">{i + 1}.</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-3 text-xs uppercase tracking-widest text-[color:var(--brand-2)]">Output</p>
                    <p className="mt-1 text-sm">{w.output}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Honest caveats</p>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {blueprint.caveats.map((c) => (
                  <li key={c} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-2)]" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">{DISCLAIMER}</p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8 mt-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h3 className="text-xl sm:text-2xl font-bold">Get the n8n templates that do this</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            The Builder tier includes the workflow library and builders — the same automations above, ready to import
            and adapt instead of building from scratch.
          </p>
          <Button
            asChild
            size="lg"
            variant="brand"
            className="mt-5 h-12 px-7"
            onClick={() => dlToolCtaClick(SLUG, { location: "result-cta", target_tier: "builder" })}
          >
            <Link to="/pricing">
              See Builder pricing <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* FAQ */}
        <div className="mt-12 max-w-3xl mx-auto">
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
