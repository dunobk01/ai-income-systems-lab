import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ogImageMeta } from "@/lib/og";
import { CURRICULUM_MODULES, CURRICULUM_SENTENCE, CURRICULUM } from "@/lib/curriculum";

export const Route = createFileRoute("/curriculum")({
  head: () => ({
    meta: [
      { title: "Curriculum — AI Income Systems Lab" },
      { name: "description", content: `${CURRICULUM_SENTENCE}. The full sequence that takes you from zero to a live AI income system in 7 days.` },
      { property: "og:title", content: "Curriculum — AI Income Systems Lab" },
      { property: "og:description", content: `${CURRICULUM_SENTENCE}. The full sequence that takes you from zero to a live AI income system.` },
      { property: "og:url", content: "https://ai-income-systems.com/curriculum" },
    
      ...ogImageMeta(),
    ],
    links: [{ rel: "canonical", href: "https://ai-income-systems.com/curriculum" }],
  }),
  component: CurriculumPage,
});

const modules = CURRICULUM_MODULES;

function CurriculumPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Curriculum
          </div>
          <h1 className="mt-5 text-4xl sm:text-6xl font-black tracking-tight">
            {CURRICULUM.modules} modules. {CURRICULUM.lessons} lessons.<br />
            <span className="text-gradient">One real income system.</span>
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-muted-foreground">
            Sequenced so each module builds on the last. By Module 10, your product, funnel, and automations are live — not a theory deck.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20 space-y-4">
        {modules.map((m) => {
          const link = CURRICULUM_LINKS[m.n];
          return (
          <article key={m.n} className="glass-strong rounded-2xl p-6 transition hover:border-[color:var(--brand-2)]/40">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="sm:w-48 shrink-0">
                <p className="text-xs font-mono text-muted-foreground">Module {m.n}</p>
                <h2 className="mt-1 text-xl font-semibold">
                  {link ? (
                    <Link
                      to="/course/$moduleSlug/$lessonSlug"
                      params={{ moduleSlug: link.moduleSlug, lessonSlug: link.lessonSlug }}
                      className="hover:text-[color:var(--brand-2)] transition-colors"
                    >
                      {m.title}
                    </Link>
                  ) : (
                    m.title
                  )}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">{m.lessons} lessons</p>
                {link && (
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link
                      to="/course/$moduleSlug/$lessonSlug"
                      params={{ moduleSlug: link.moduleSlug, lessonSlug: link.lessonSlug }}
                    >
                      Open module <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground/90 leading-relaxed">
                  <span className="text-[color:var(--brand)] font-semibold">Outcome: </span>{m.outcome}
                </p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {m.topics.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-[color:var(--brand-2)] mt-0.5 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-24">
        <div className="glass-strong rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to start Module 01?</h2>
          <p className="mt-2 text-muted-foreground">Pick a tier, get instant access, and ship your first income system in 7 days.</p>
          <Button asChild size="lg" variant="brand" className="mt-6 h-12 px-7">
            <Link to="/pricing">See pricing <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
