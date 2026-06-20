import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, ExternalLink, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { Header, LockedView } from "./builders/product";
import { tools } from "@/lib/tools-data";

export const Route = createFileRoute("/_authenticated/tools")({
  head: () => ({ meta: [{ title: "AI Tool Stack — AI Income Systems Lab" }] }),
  component: ToolsPage,
});

const tierOk = (t?: string, isAdmin?: boolean) => isAdmin === true || t === "builder" || t === "pro";

function ToolsPage() {
  const { profile, isAdmin } = useAuth();
  if (!tierOk(profile?.tier, isAdmin)) return <LockedView title="AI Tool Stack Guide" />;
  const categories = Array.from(new Set(tools.map((t) => t.category)));
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <Header icon={<Wrench className="h-5 w-5" />} eyebrow="Stack" title="The AI Income Tool Stack" subtitle="Our opinionated list of tools that actually pay for themselves. Click any tool for the full breakdown." />

      {categories.map((cat) => (
        <section key={cat} className="mt-10">
          <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">{cat}</h2>
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
        </section>
      ))}
    </div>
  );
}
