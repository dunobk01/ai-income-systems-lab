import { Reveal } from "./reveal";

export type Step = { title: string; detail?: string };

export function StepFlow({ steps }: { steps: Step[] }) {
  return (
    <div className="my-8 flex flex-col gap-4 md:flex-row md:items-stretch">
      {steps.map((s, i) => (
        <Reveal key={i} delay={i * 90} className="relative flex-1">
          <div className="glass h-full rounded-xl p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--brand)]/50 font-display text-sm font-bold text-[color:var(--brand)]">
                {i + 1}
              </span>
              <h4 className="font-display text-base font-bold">{s.title}</h4>
            </div>
            {s.detail && <p className="mt-2 text-sm text-muted-foreground">{s.detail}</p>}
          </div>
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute left-4 top-full h-4 w-px bg-[color:var(--brand)]/40 md:left-full md:top-1/2 md:h-px md:w-4"
            />
          )}
        </Reveal>
      ))}
    </div>
  );
}
