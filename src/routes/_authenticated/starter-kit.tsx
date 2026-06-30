import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Cog, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { starterKit } from "@/lib/starter-kit-data";

export const Route = createFileRoute("/_authenticated/starter-kit")({
  head: () => ({
    meta: [
      { title: "AI Tool Starter Kit — AI Income Systems Lab" },
      { name: "description", content: "The exact tools, setup steps, and recommended starting configurations to get your AI stack live in days, not weeks." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StarterKitPage,
});

function StarterKitPage() {
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-2)]">Members-only setup guide</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
          AI Tool <span className="text-gradient">Starter Kit</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          The exact tools we use, why we picked each one, the setup steps that matter, and the starting configuration we'd give a friend on day 1. Get your AI stack live in days, not weeks.
        </p>
      </header>

      <div className="grid gap-10">
        {starterKit.map((section) => (
          <section key={section.title}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="text-sm text-muted-foreground">{section.subtitle}</p>
            </div>
            <div className="grid gap-4">
              {section.tools.map((tool) => (
                <article key={tool.name} className="glass-strong rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold">{tool.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{tool.category}</Badge>
                        <span className="text-xs text-muted-foreground">{tool.pricing}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-foreground/90">{tool.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground"><span className="text-foreground/80 font-medium">Why it's our pick:</span> {tool.whyIts1stPick}</p>

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-[color:var(--brand-2)] mb-2 flex items-center gap-1.5">
                        <Cog className="h-3.5 w-3.5" /> Setup steps
                      </h4>
                      <ol className="grid gap-1.5 text-sm list-decimal list-inside text-foreground/90">
                        {tool.setupSteps.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-[color:var(--brand-2)] mb-2 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> Recommended config
                      </h4>
                      <ul className="grid gap-1.5 text-sm list-disc list-inside text-foreground/90">
                        {tool.recommendedConfig.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 glass rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[color:var(--brand)] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">First-week win</p>
                      <p className="text-sm mt-0.5">{tool.firstWin}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    <span className="text-foreground/80">Or swap for:</span> {tool.swapWith.join(" · ")}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
