import { Check } from "lucide-react";

/**
 * Renders a stored free-tool report (the same content shown on-page after
 * email capture) from its saved JSON, for the permanent /free-tools/r/$token
 * page.
 */

type Scorecard = {
  headline: string;
  summary: string;
  automations: { rank: number; title: string; impact: string; effort: string; why: string; tools: string[] }[];
  plan: { window: string; focus: string; actions: string[] }[];
  prompts: { title: string; prompt: string }[];
};

type Blueprint = {
  headline: string;
  summary: string;
  workflows: {
    rank: number;
    task: string;
    title: string;
    why: string;
    trigger: string;
    steps: string[];
    output: string;
    tools: string[];
  }[];
  caveats: string[];
};

type FixList = {
  headline: string;
  summary: string;
  actions: { rank: number; area: string; title: string; why: string; steps: string[]; prompt: string }[];
};

const H4 = ({ children }: { children: React.ReactNode }) => (
  <h4 className="mt-8 text-sm uppercase tracking-[0.2em] text-muted-foreground">{children}</h4>
);

const Pill = ({ children, accent }: { children: React.ReactNode; accent?: boolean }) => (
  <span className={`rounded-full glass px-2 py-0.5 ${accent ? "text-[color:var(--brand-2)]" : ""}`}>{children}</span>
);

const Steps = ({ items }: { items: string[] }) => (
  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
    {items.map((s, i) => (
      <li key={i} className="flex gap-2">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-2)]" />
        <span>{s}</span>
      </li>
    ))}
  </ul>
);

const PromptBlock = ({ text }: { text: string }) => (
  <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-muted-foreground">
    {text}
  </pre>
);

export function ReportView({ toolSlug, report }: { toolSlug: string; report: unknown }) {
  if (!report || typeof report !== "object") return null;

  if (toolSlug === "ai-savings-calculator") {
    const r = report as Blueprint;
    return (
      <div>
        <h3 className="text-2xl font-bold">{r.headline}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>
        <H4>Automation blueprint</H4>
        <div className="mt-3 space-y-3">
          {(r.workflows ?? []).map((w) => (
            <div key={w.rank} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--brand)]/20 text-xs font-bold">
                  {w.rank}
                </span>
                <span className="font-semibold">{w.title}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <Pill>{w.task}</Pill>
                {(w.tools ?? []).map((t) => (
                  <Pill key={t} accent>
                    {t}
                  </Pill>
                ))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{w.why}</p>
              <p className="mt-3 text-xs uppercase tracking-widest text-[color:var(--brand-2)]">Trigger</p>
              <p className="text-sm text-muted-foreground">{w.trigger}</p>
              <p className="mt-3 text-xs uppercase tracking-widest text-[color:var(--brand-2)]">Steps</p>
              <Steps items={w.steps ?? []} />
              <p className="mt-3 text-xs uppercase tracking-widest text-[color:var(--brand-2)]">Output</p>
              <p className="text-sm text-muted-foreground">{w.output}</p>
            </div>
          ))}
        </div>
        {(r.caveats ?? []).length > 0 && (
          <>
            <H4>Worth knowing</H4>
            <Steps items={r.caveats} />
          </>
        )}
      </div>
    );
  }

  if (toolSlug === "ai-visibility-check") {
    const r = report as FixList;
    return (
      <div>
        <h3 className="text-2xl font-bold">{r.headline}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>
        <H4>Your fix list</H4>
        <div className="mt-3 space-y-3">
          {(r.actions ?? []).map((a) => (
            <div key={a.rank} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--brand)]/20 text-xs font-bold">
                  {a.rank}
                </span>
                <span className="font-semibold">{a.title}</span>
                <Pill accent>{a.area}</Pill>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{a.why}</p>
              <Steps items={a.steps ?? []} />
              <PromptBlock text={a.prompt} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const r = report as Scorecard;
  return (
    <div>
      <h3 className="text-2xl font-bold">{r.headline}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>

      <H4>Top 3 automations</H4>
      <div className="mt-3 space-y-3">
        {(r.automations ?? []).map((a) => (
          <div key={a.rank} className="glass rounded-2xl p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--brand)]/20 text-xs font-bold">
                {a.rank}
              </span>
              <span className="font-semibold">{a.title}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <Pill>Impact: {a.impact}</Pill>
              <Pill>Effort: {a.effort}</Pill>
              {(a.tools ?? []).map((t) => (
                <Pill key={t} accent>
                  {t}
                </Pill>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{a.why}</p>
          </div>
        ))}
      </div>

      <H4>Your 30-day starter plan</H4>
      <div className="mt-3 space-y-3">
        {(r.plan ?? []).map((p) => (
          <div key={p.window} className="glass rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-[color:var(--brand-2)]">{p.window}</p>
            <p className="mt-1 font-semibold">{p.focus}</p>
            <Steps items={p.actions ?? []} />
          </div>
        ))}
      </div>

      <H4>Copy-paste prompts</H4>
      <div className="mt-3 space-y-3">
        {(r.prompts ?? []).map((p) => (
          <div key={p.title} className="glass rounded-2xl p-5">
            <p className="font-semibold">{p.title}</p>
            <PromptBlock text={p.prompt} />
          </div>
        ))}
      </div>
    </div>
  );
}
