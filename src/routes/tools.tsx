import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, ExternalLink, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tools } from "@/lib/tools-data";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "AI Tool Stack — AI Income Systems Lab" },
      { name: "description", content: "The opinionated AI tool stack we teach: ChatGPT, Claude, Perplexity, Lovable, n8n and the supporting cast. Click any tool for the full breakdown." },
      { property: "og:title", content: "AI Tool Stack — AI Income Systems Lab" },
      { property: "og:description", content: "The opinionated AI tool stack we teach. Click any tool for the full breakdown of when to use it." },
      { property: "og:url", content: "https://ai-income-systems.com/tools" },
    ],
    links: [{ rel: "canonical", href: "https://ai-income-systems.com/tools" }],
  }),
  component: ToolsPublicPage,
});

function ToolsPublicPage() {
  const categories = Array.from(new Set(tools.map((t) => t.category)));
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Wrench className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Tool stack
          </div>
          <h1 className="mt-5 text-4xl sm:text-6xl font-black tracking-tight">
            The AI Income <span className="text-gradient">Tool Stack</span>
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-muted-foreground">
            Every tool we teach, why we picked it, what it pairs with, and how it earns its monthly fee. Click any tool for the full breakdown.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        {categories.map((cat) => (
          <div key={cat} className="mt-10 first:mt-0">
            <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">{cat}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tools.filter((t) => t.category === cat).map((t) => (
                <Link
                  key={t.slug}
                  to="/tools/$slug"
                  params={{ slug: t.slug }}
                  className="group glass rounded-2xl p-5 flex flex-col text-left transition hover:bg-white/5 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold group-hover:text-[color:var(--brand)] transition-colors">{t.name}</h3>
                    <Badge variant="outline" className="border-white/15 text-[10px]">{t.price}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{t.useFor}</p>
                  <p className="text-xs text-foreground/70 mt-3 leading-relaxed"><span className="text-[color:var(--brand)] font-semibold">Why: </span>{t.whyWeRecommend}</p>
                  <div className="mt-3 text-xs text-muted-foreground">Pairs with: {t.pairsWith.join(", ")}</div>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-[color:var(--brand)]">
                      View details <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-24">
        <div className="glass-strong rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="text-2xl sm:text-3xl font-bold">Learn the whole stack inside the Lab.</h2>
          <p className="mt-2 text-muted-foreground">11 modules teach you when to use which tool and how to wire them into one system.</p>
          <Button asChild size="lg" variant="brand" className="mt-6 h-12 px-7">
            <Link to="/pricing">See pricing <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
