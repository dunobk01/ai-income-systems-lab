import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Sparkles, Workflow, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { templates, type TemplateKind } from "@/lib/templates-data";

export const Route = createFileRoute("/_authenticated/library/")({
  head: () => ({
    meta: [
      { title: "Template Library — AI Income Systems Lab" },
      { name: "description", content: "Flagship prompt templates, n8n workflows, and Lovable app starters — production-grade, ready to ship." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LibraryIndex,
});

const kindMeta: Record<TemplateKind, { label: string; icon: typeof Sparkles; color: string }> = {
  prompt: { label: "Prompt", icon: Sparkles, color: "text-amber-300" },
  n8n: { label: "n8n Workflow", icon: Workflow, color: "text-sky-300" },
  lovable: { label: "Lovable Starter", icon: Layers, color: "text-violet-300" },
};

function LibraryIndex() {
  const { profile, isAdmin } = useAuth();
  const tier = profile?.tier ?? "none";
  const canAccess = isAdmin || tier === "builder" || tier === "pro";

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-2)]">Template Library</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
          Flagship templates. <span className="text-gradient">Built to ship.</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Six in-depth, production-grade templates: mega-prompts, end-to-end n8n workflows, and full Lovable app starters. Each one is documented top-to-bottom — use cases, setup, pro tips, the lot.
        </p>
      </div>

      {!canAccess && (
        <div className="mb-8 glass-strong rounded-2xl p-6 ring-brand flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl shrink-0" style={{ background: "var(--gradient-soft)" }}>
            <Lock className="h-5 w-5 text-[color:var(--brand)]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold">Library is a Builder & Pro perk</h3>
            <p className="text-sm text-muted-foreground">You can browse summaries here. Upgrade to unlock the full prompts, workflows, and starter app prompts.</p>
          </div>
          <Button asChild variant="brand" className="sm:ml-auto"><Link to="/pricing">See plans <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => {
          const meta = kindMeta[t.kind];
          const Icon = meta.icon;
          return (
            <Link
              key={t.slug}
              to="/library/$slug"
              params={{ slug: t.slug }}
              className="glass hover:bg-white/8 transition rounded-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs">
                  <Icon className={`h-4 w-4 ${meta.color}`} />
                  <span className="text-muted-foreground">{meta.label}</span>
                </div>
                {!canAccess && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
              <h3 className="mt-3 font-semibold leading-snug">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{t.summary}</p>
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                <Badge variant="outline" className="text-[10px]">{t.difficulty}</Badge>
                <Badge variant="outline" className="text-[10px]">{t.estTime}</Badge>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
