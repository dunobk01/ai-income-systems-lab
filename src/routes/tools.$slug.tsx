import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Wrench, CheckCircle2, Users, Sparkles, Layers, Lightbulb, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getToolBySlug, tools } from "@/lib/tools-data";
import { ogImageMeta } from "@/lib/og";

export const Route = createFileRoute("/tools/$slug")({
  head: ({ params }) => {
    const tool = getToolBySlug(params.slug);
    return {
      meta: [
        { title: tool ? `${tool.name} — AI Tool Stack` : "Tool — AI Income Systems Lab" },
        { name: "description", content: tool?.description ?? "AI tool details" },
        { property: "og:title", content: tool ? `${tool.name} — AI Tool Stack` : "Tool" },
        { property: "og:description", content: tool?.description ?? "AI tool details" },
      
        ...ogImageMeta(),
      ],
    };
  },
  loader: ({ params }) => {
    if (!getToolBySlug(params.slug)) throw notFound();
    return null;
  },
  component: ToolDetailPublic,
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="p-10 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold">Tool not found</h1>
        <Link to="/tools" className="mt-4 inline-flex items-center gap-1 text-sm text-[color:var(--brand)]">
          <ArrowLeft className="h-3 w-3" /> Back to all tools
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
});

function ToolDetailPublic() {
  const { slug } = Route.useParams();
  const tool = getToolBySlug(slug)!;
  const related = tools.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-10 pb-20">
        <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> All tools
        </Link>

        <header className="mt-6 glass-strong rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Wrench className="h-3 w-3" /> {tool.category}
          </div>
          <h1 className="text-3xl lg:text-5xl font-black mt-3">{tool.name}</h1>
          <p className="text-muted-foreground mt-3 text-base lg:text-lg leading-relaxed">{tool.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="border-white/15">{tool.price}</Badge>
            <Badge variant="outline" className="border-white/15">Pairs with: {tool.pairsWith.join(", ")}</Badge>
            <a
              href={tool.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[color:var(--brand)] hover:underline ml-auto"
            >
              Visit {tool.name} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-5 mt-6">
          <Section icon={<Sparkles className="h-4 w-4" />} title="How to use it">
            <ol className="space-y-2 text-sm text-foreground/85 list-decimal pl-5">
              {tool.howToUse.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </Section>

          <Section icon={<Users className="h-4 w-4" />} title="Who it's for">
            <ul className="space-y-2 text-sm text-foreground/85">
              {tool.whoItsFor.map((w, i) => (
                <li key={i} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[color:var(--brand)] shrink-0 mt-0.5" /><span>{w}</span></li>
              ))}
            </ul>
          </Section>

          <Section icon={<CheckCircle2 className="h-4 w-4" />} title="Benefits">
            <ul className="space-y-2 text-sm text-foreground/85">
              {tool.benefits.map((b, i) => (
                <li key={i} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[color:var(--brand)] shrink-0 mt-0.5" /><span>{b}</span></li>
              ))}
            </ul>
          </Section>

          <Section icon={<Layers className="h-4 w-4" />} title="How it fits the stack">
            <p className="text-sm text-foreground/85 leading-relaxed">{tool.stackFit}</p>
            <div className="mt-3 text-xs text-muted-foreground">Pairs with: {tool.pairsWith.join(", ")}</div>
          </Section>
        </div>

        <Section icon={<Lightbulb className="h-4 w-4" />} title="Example use cases" className="mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            {tool.examples.map((ex, i) => (
              <div key={i} className="rounded-xl bg-black/20 p-4 border border-white/5">
                <div className="font-medium text-sm">{ex.title}</div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{ex.detail}</p>
              </div>
            ))}
          </div>
        </Section>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">More in {tool.category}</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to="/tools/$slug"
                  params={{ slug: r.slug }}
                  className="glass rounded-xl p-4 hover:bg-white/5 transition"
                >
                  <div className="font-medium text-sm">{r.name}</div>
                  <p className="text-xs text-muted-foreground mt-1">{r.useFor}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 glass-strong rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="text-2xl font-bold">Learn the whole stack — together.</h2>
          <p className="mt-2 text-muted-foreground text-sm">{tool.name} is one of five. The Lab teaches you to wire them into one income system.</p>
          <Button asChild size="lg" variant="brand" className="mt-5 h-11 px-6">
            <Link to="/pricing">See pricing <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function Section({ icon, title, children, className = "" }: { icon: React.ReactNode; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`glass rounded-2xl p-5 lg:p-6 ${className}`}>
      <h2 className="flex items-center gap-2 text-sm font-semibold mb-3">
        <span className="text-[color:var(--brand)]">{icon}</span>{title}
      </h2>
      {children}
    </section>
  );
}
