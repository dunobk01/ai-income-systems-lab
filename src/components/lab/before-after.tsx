import { Reveal } from "./reveal";

export function BeforeAfter({
  before,
  after,
  beforeTitle = "Before",
  afterTitle = "After",
}: {
  before: string[];
  after: string[];
  beforeTitle?: string;
  afterTitle?: string;
}) {
  return (
    <Reveal className="my-8 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-[color:var(--destructive)]/35 bg-[color:var(--destructive)]/[0.07] p-5">
        <h4 className="text-sm font-semibold uppercase tracking-widest text-[color:var(--destructive)]">
          {beforeTitle}
        </h4>
        <ul className="mt-3 space-y-2 text-sm text-foreground/85">
          {before.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden="true">·</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-[color:var(--brand)]/40 bg-[color:var(--brand)]/[0.07] p-5">
        <h4 className="text-sm font-semibold uppercase tracking-widest text-[color:var(--brand)]">
          {afterTitle}
        </h4>
        <ul className="mt-3 space-y-2 text-sm text-foreground/85">
          {after.map((a, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden="true">·</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
