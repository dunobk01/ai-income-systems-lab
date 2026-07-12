import { Link } from "@tanstack/react-router";
import { Check, X as XIcon, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export type ComparisonRow = {
  label: string;
  us: boolean | string;
  them: boolean | string;
};

export type ComparisonFaq = { q: string; a: string };

export type ComparisonPageProps = {
  competitor: string;
  competitorTagline: string;
  headline: string;
  subline: string;
  rows: ComparisonRow[];
  whyWeWin: { title: string; body: string }[];
  faqs: ComparisonFaq[];
  canonicalPath: string;
};

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <Check className="h-4 w-4 text-[color:var(--brand-2)] mx-auto" aria-label="Yes" />;
  if (v === false) return <XIcon className="h-4 w-4 text-muted-foreground/50 mx-auto" aria-label="No" />;
  return <span className="text-xs text-foreground/85">{v}</span>;
}

export function ComparisonPageView(props: ComparisonPageProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-20 pb-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            AI Income Systems Lab <span className="text-[color:var(--brand-2)]">vs.</span> {props.competitor}
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight">
            {props.headline}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{props.subline}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="brand" size="lg">
              <Link to="/pricing">See pricing <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link to="/curriculum">See the curriculum</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-10">
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-medium px-5 py-4 w-2/5">Feature</th>
                  <th className="text-center font-medium px-3 py-4 bg-white/5">
                    AI Income Systems
                  </th>
                  <th className="text-center font-medium px-3 py-4">
                    {props.competitor}
                    <div className="mt-1 text-[10px] font-normal normal-case tracking-normal text-muted-foreground/70">
                      {props.competitorTagline}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {props.rows.map((r) => (
                  <tr key={r.label} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3">{r.label}</td>
                    <td className="px-3 py-3 text-center bg-white/5"><Cell v={r.us} /></td>
                    <td className="px-3 py-3 text-center"><Cell v={r.them} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-16">
        <h2 className="text-2xl font-bold tracking-tight text-center">
          Why builders pick us over <span className="text-gradient">{props.competitor}</span>
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {props.whyWeWin.map((w) => (
            <div key={w.title} className="glass rounded-2xl p-5">
              <h3 className="font-semibold">{w.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <h2 className="text-2xl font-bold tracking-tight">Common questions</h2>
        <div className="mt-6 space-y-3">
          {props.faqs.map((f) => (
            <details key={f.q} className="glass rounded-xl px-5 py-4 group">
              <summary className="font-medium cursor-pointer list-none flex justify-between items-center gap-3">
                <span>{f.q}</span>
                <span className="text-muted-foreground group-open:rotate-45 transition shrink-0">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-24">
        <div className="glass-strong rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to build something you can sell?</h2>
          <p className="mt-2 text-muted-foreground">Start Starter at $29/mo — cancel anytime.</p>
          <Button asChild size="lg" variant="brand" className="mt-6 h-12 px-7">
            <Link to="/pricing">See pricing <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

export function comparisonFaqLd(faqs: ComparisonFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
