import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Check, Lock, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";

type Tier = "starter" | "builder" | "pro";
type Module = { id: string; slug: string; title: string; summary: string | null; required_tier: Tier; order_index: number; is_preview: boolean };
type Lesson = { id: string; slug: string; title: string; module_id: string; order_index: number; duration_minutes: number | null };

const tierRank: Record<string, number> = { none: 0, starter: 1, builder: 2, pro: 3 };

export const Route = createFileRoute("/_authenticated/course/")({
  head: () => ({ meta: [{ title: "Course — AI Income Systems Lab" }] }),
  component: CoursePage,
});

function CoursePage() {
  const { profile, user, isAdmin } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [{ data: mods, error: mErr }, { data: lsns, error: lErr }] = await Promise.all([
          supabase.from("modules").select("id, slug, title, summary, required_tier, order_index, is_preview").order("order_index"),
          supabase.from("lessons").select("id, slug, title, module_id, order_index, duration_minutes").order("order_index"),
        ]);
        if (mErr) throw mErr; if (lErr) throw lErr;
        setModules((mods ?? []) as Module[]);
        setLessons((lsns ?? []) as Lesson[]);
        if (user) {
          const { data: prog } = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("completed", true);
          setCompleted(new Set((prog ?? []).map((p) => p.lesson_id)));
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const userRank = isAdmin ? 3 : tierRank[profile?.tier ?? "none"];
  const totalLessons = lessons.length;
  const completedCount = completed.size;
  const pct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Curriculum</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold">The <span className="text-gradient">AI Income Systems</span> course</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">11 modules · {totalLessons} lessons · Practical, built around what you ship.</p>
        </div>
        <div className="glass rounded-2xl px-5 py-3 text-sm">
          <span className="font-semibold">{completedCount}</span>
          <span className="text-muted-foreground"> / {totalLessons} lessons · {pct}%</span>
        </div>
      </div>

      {error && <div className="mt-6 glass rounded-2xl p-4 text-sm text-red-300">Couldn't load curriculum: {error}</div>}
      {loading && <div className="mt-10 text-sm text-muted-foreground">Loading curriculum…</div>}

      <div className="mt-8 space-y-4">
        {modules.map((m, i) => {
          const moduleLessons = lessons.filter((l) => l.module_id === m.id);
          const locked = userRank < tierRank[m.required_tier] && !m.is_preview;
          const doneInMod = moduleLessons.filter((l) => completed.has(l.id)).length;
          return (
            <section key={m.id} className="glass rounded-2xl overflow-hidden">
              <div className="p-5 sm:p-6 flex items-start gap-4">
                <div className="hidden sm:grid h-10 w-10 place-items-center rounded-lg shrink-0 text-sm font-bold" style={{ background: "var(--gradient-soft)" }}>
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold">{m.title}</h2>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-white/15">{m.required_tier}</Badge>
                    {m.is_preview && userRank < tierRank[m.required_tier] && (
                      <Badge className="text-[10px] uppercase bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Free preview</Badge>
                    )}
                    {locked && <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"><Lock className="h-3 w-3" /> Locked</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{m.summary}</p>
                  <p className="text-xs text-muted-foreground mt-2">{doneInMod} / {moduleLessons.length} done</p>
                </div>
              </div>
              <div className="border-t border-white/5 divide-y divide-white/5">
                {moduleLessons.map((l) => {
                  const isDone = completed.has(l.id);
                  const Inner = (
                    <>
                      {isDone ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : locked ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <PlayCircle className="h-4 w-4 text-[color:var(--brand)]" />
                      )}
                      <span className="text-sm flex-1 min-w-0 truncate">{l.title}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{l.duration_minutes ?? 10} min</span>
                    </>
                  );
                  if (locked) {
                    return (
                      <div key={l.id} className="flex items-center gap-3 px-5 sm:px-6 py-3 opacity-50">{Inner}</div>
                    );
                  }
                  return (
                    <Link
                      key={l.id}
                      to="/course/$moduleSlug/$lessonSlug"
                      params={{ moduleSlug: m.slug, lessonSlug: l.slug }}
                      className="flex items-center gap-3 px-5 sm:px-6 py-3 hover:bg-white/5 transition"
                    >
                      {Inner}
                    </Link>
                  );
                })}
              </div>
              {locked && (
                <div className="bg-white/5 px-6 py-3 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Unlock this module by upgrading to {m.required_tier}.</span>
                  <Link to="/pricing" className="text-[color:var(--brand)] hover:underline">View pricing →</Link>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {!loading && modules.length === 0 && (
        <div className="mt-10 glass rounded-2xl p-10 text-center">
          <BookOpen className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No modules yet. Check back soon.</p>
        </div>
      )}
    </div>
  );
}
