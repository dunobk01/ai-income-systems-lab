import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Layers, Rocket, Bot, Zap, Wand2, Sparkles, DollarSign, Clock, Target, Lightbulb } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSystemBySlug, systems } from "@/lib/systems-data";
import { ogImageMeta } from "@/lib/og";

export const Route = createFileRoute("/systems/$slug")({
  head: ({ params }) => {
    const s = getSystemBySlug(params.slug);
    return {
      meta: [
        { title: s ? `${s.title} — Build with AI Income Systems Lab` : "System — AI Income Systems Lab" },
        { name: "description", content: s?.tagline ?? "Build real AI income systems" },
        { property: "og:title", content: s ? `${s.title} — Build with AI Income Systems Lab` : "System" },
        { property: "og:description", content: s?.summary ?? "Build real AI income systems" },
      
        ...ogImageMeta(),
      ],
    };
  },
  loader: ({ params }) => {
    if (!getSystemBySlug(params.slug)) throw notFound();
    return null;
  },
  component: SystemDetail,
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="p-10 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold">System not found</h1>
        <Link to="/" className="mt-4 inline-flex items-center gap-1 text-sm text-[color:var(--brand)]">
          <ArrowLeft className="h-3 w-3" /> Back home
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
});

const iconMap = { layers: Layers, rocket: Rocket, bot: Bot, zap: Zap, wand: Wand2, sparkles: Sparkles };

function SystemDetail() {
  const { slug } = Route.useParams();
  const s = getSystemBySlug(slug)!;
  const Icon = iconMap[s.icon];
  const others = systems.filter((x) => x.slug !== s.slug).slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-12 pb-12">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Back home
          </Link>
          <div className="mt-6 flex items-start gap-5">
            <div className="grid h-14 w-14 place-items-center rounded-2xl shrink-0" style={{ background: "var(--gradient-soft)" }}>
              <Icon className="h-7 w-7 text-[color:var(--brand)]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">System</p>
              <h1 className="mt-1 text-4xl sm:text-5xl font-black tracking-tight">{s.title}</h1>
              <p className="mt-3 text-lg text-muted-foreground">{s.tagline}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-16 space-y-6">

        {/* Summary + KPIs */}
        <section className="glass-strong rounded-2xl p-6 lg:p-8">
          <p className="text-base lg:text-lg text-foreground/90 leading-relaxed">{s.summary}</p>
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            <Kpi icon={<Clock className="h-4 w-4" />} label="Time to ship" value={s.timeToShip} />
            <Kpi icon={<DollarSign className="h-4 w-4" />} label="Pricing range" value={s.startingPrice} />
            <Kpi icon={<Target className="h-4 w-4" />} label="Realistic 90-day outcome" value={s.realisticOutcome} clamp />
          </div>
        </section>

        {/* What you build */}
        <Section icon={<CheckCircle2 className="h-4 w-4" />} title="What you'll actually build">
          <ul className="grid gap-2 sm:grid-cols-2">
            {s.whatYouBuild.map((w) => (
              <li key={w} className="flex gap-2 text-sm text-foreground/90">
                <CheckCircle2 className="h-4 w-4 text-[color:var(--brand)] shrink-0 mt-0.5" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Examples */}
        <Section icon={<Lightbulb className="h-4 w-4" />} title="Real-world examples">
          <div className="grid md:grid-cols-2 gap-4">
            {s.examples.map((ex) => (
              <div key={ex.title} className="rounded-xl bg-black/20 p-4 border border-white/5">
                <p className="font-medium text-sm">{ex.title}</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{ex.detail}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Tools used */}
        <Section icon={<Layers className="h-4 w-4" />} title="The tool stack for this system">
          <div className="grid sm:grid-cols-2 gap-3">
            {s.toolsUsed.map((t) => (
              <div key={t.name} className="rounded-xl bg-black/20 p-4 border border-white/5">
                <p className="font-semibold text-sm text-[color:var(--brand)]">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.role}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Steps */}
        <Section icon={<Rocket className="h-4 w-4" />} title="How you build it, step by step">
          <ol className="space-y-3">
            {s.steps.map((st, i) => (
              <li key={st.title} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-xs font-mono">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-sm font-semibold">{st.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{st.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* Monetization */}
        <Section icon={<DollarSign className="h-4 w-4" />} title="How it makes money">
          <ul className="space-y-2">
            {s.monetization.map((m) => (
              <li key={m} className="flex gap-2 text-sm text-foreground/90">
                <CheckCircle2 className="h-4 w-4 text-[color:var(--brand-2)] shrink-0 mt-0.5" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Other systems */}
        <section className="pt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Other systems you can build</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {others.map((o) => {
              const OIcon = iconMap[o.icon];
              return (
                <Link
                  key={o.slug}
                  to="/systems/$slug"
                  params={{ slug: o.slug }}
                  className="glass rounded-xl p-4 hover:bg-white/5 transition"
                >
                  <OIcon className="h-5 w-5 text-[color:var(--brand)]" />
                  <p className="font-medium text-sm mt-2">{o.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{o.tagline}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <div className="glass-strong rounded-3xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
            <Badge variant="outline" className="border-white/15">{s.title}</Badge>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold">Build this inside the Lab.</h2>
            <p className="mt-2 text-muted-foreground">Everything you need — prompts, builders, workflow templates — wrapped into one curriculum.</p>
            <Button asChild size="lg" variant="brand" className="mt-6 h-12 px-7">
              <Link to="/pricing">See pricing <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}

function Kpi({ icon, label, value, clamp }: { icon: React.ReactNode; label: string; value: string; clamp?: boolean }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <span className="text-[color:var(--brand-2)]">{icon}</span>{label}
      </div>
      <p className={`mt-2 text-sm font-medium ${clamp ? "" : ""}`}>{value}</p>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-6 lg:p-7">
      <h2 className="flex items-center gap-2 text-sm font-semibold mb-4 uppercase tracking-[0.15em]">
        <span className="text-[color:var(--brand)]">{icon}</span>{title}
      </h2>
      {children}
    </section>
  );
}
