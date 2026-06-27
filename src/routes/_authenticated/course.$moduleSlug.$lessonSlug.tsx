import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lock, Loader2, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { dlCourseProgress } from "@/lib/datalayer";

type Tier = "starter" | "builder" | "pro";
type Module = { id: string; slug: string; title: string; required_tier: Tier; order_index: number; is_preview: boolean };
type Lesson = {
  id: string; slug: string; title: string; module_id: string;
  content: string | null; action_steps: string | null;
  video_url: string | null; resource_url: string | null;
  duration_minutes: number | null; order_index: number;
};

const hasCurriculumAccess = (tier?: string, isAdmin?: boolean) =>
  isAdmin === true || tier === "monthly" || tier === "starter" || tier === "builder" || tier === "pro";

export const Route = createFileRoute("/_authenticated/course/$moduleSlug/$lessonSlug")({
  head: () => ({ meta: [{ title: "Lesson — AI Income Systems Lab" }] }),
  component: LessonPage,
});

function LessonPage() {
  const { moduleSlug, lessonSlug } = Route.useParams();
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [siblings, setSiblings] = useState<Lesson[]>([]);
  const [completed, setCompleted] = useState(false);
  const [note, setNote] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true); setError(null);
      try {
        const { data: mod, error: mErr } = await supabase.from("modules").select("id, slug, title, required_tier, order_index, is_preview").eq("slug", moduleSlug).maybeSingle();
        if (mErr) throw mErr;
        if (!mod) { setError("Module not found"); return; }
        setModule(mod as Module);
        const { data: ls, error: lErr } = await supabase.from("lessons").select("*").eq("module_id", mod.id).order("order_index");
        if (lErr) throw lErr;
        const all = (ls ?? []) as Lesson[];
        setSiblings(all);
        const cur = all.find((l) => l.slug === lessonSlug) ?? null;
        if (!cur) { setError("Lesson not found"); return; }
        setLesson(cur);
        if (user) {
          const [{ data: prog }, { data: notes }] = await Promise.all([
            supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", user.id).eq("lesson_id", cur.id).maybeSingle(),
            supabase.from("user_notes").select("id, content").eq("user_id", user.id).eq("lesson_id", cur.id).maybeSingle(),
          ]);
          setCompleted(!!prog?.completed);
          setNote(notes?.content ?? "");
          setNoteId(notes?.id ?? null);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally { setLoading(false); }
    })();
  }, [moduleSlug, lessonSlug, user]);

  const canAccess = hasCurriculumAccess(profile?.tier, isAdmin);
  const locked = module ? (!canAccess && !module.is_preview) : false;

  const idx = useMemo(() => siblings.findIndex((l) => l.id === lesson?.id), [siblings, lesson]);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const markComplete = async () => {
    if (!user || !lesson) return;
    setCompleting(true);
    const { error: err } = await supabase
      .from("lesson_progress")
      .upsert({ user_id: user.id, lesson_id: lesson.id, completed: true, completed_at: new Date().toISOString() }, { onConflict: "user_id,lesson_id" });
    setCompleting(false);
    if (err) { toast.error("Couldn't save progress: " + err.message); return; }
    setCompleted(true);
    toast.success("Marked complete");
    if (next && module) {
      void navigate({ to: "/course/$moduleSlug/$lessonSlug", params: { moduleSlug: module.slug, lessonSlug: next.slug } });
    }
  };

  const saveNote = async () => {
    if (!user || !lesson) return;
    setSaving(true);
    if (noteId) {
      const { error: err } = await supabase.from("user_notes").update({ content: note }).eq("id", noteId);
      if (err) toast.error("Couldn't save note: " + err.message); else toast.success("Note saved");
    } else {
      const { data, error: err } = await supabase.from("user_notes").insert({ user_id: user.id, lesson_id: lesson.id, content: note }).select("id").single();
      if (err) toast.error("Couldn't save note: " + err.message);
      else { setNoteId(data.id); toast.success("Note saved"); }
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-10 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading lesson…</div>;
  }
  if (error || !lesson || !module) {
    return (
      <div className="p-10 max-w-2xl">
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-red-300">{error ?? "Lesson not found"}</p>
          <Button asChild variant="glass" className="mt-4"><Link to="/course">Back to course</Link></Button>
        </div>
      </div>
    );
  }
  if (locked) {
    return (
      <div className="p-10 max-w-2xl">
        <div className="glass-strong rounded-2xl p-8 text-center">
          <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
          <h1 className="mt-3 text-xl font-bold">Unlock the full curriculum</h1>
          <p className="mt-2 text-sm text-muted-foreground">Start All-Access Monthly at $14.99/mo, or grab lifetime access from $29.</p>
          <div className="mt-5 flex gap-2 justify-center">
            <Button asChild variant="brand"><Link to="/pricing">See plans</Link></Button>
            <Button asChild variant="glass"><Link to="/course">Back to course</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  const steps = (lesson.action_steps ?? "").split(/\n+/).filter(Boolean);

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <Link to="/course" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Back to course</Link>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="border-white/15">{module.title}</Badge>
        <span>·</span>
        <span>Lesson {idx + 1} of {siblings.length}</span>
        <span>·</span>
        <span>{lesson.duration_minutes ?? 10} min</span>
      </div>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">{lesson.title}</h1>

      {lesson.video_url && (
        <div className="mt-6 aspect-video rounded-2xl overflow-hidden glass">
          <iframe src={lesson.video_url} title={lesson.title} className="w-full h-full" allowFullScreen />
        </div>
      )}

      <article className="mt-6 glass rounded-2xl p-6 prose prose-invert prose-headings:mt-6 prose-headings:mb-3 prose-p:leading-relaxed prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content ?? ""}</ReactMarkdown>
      </article>

      {steps.length > 0 && (
        <section className="mt-6 glass rounded-2xl p-6">
          <h2 className="font-semibold mb-3">Action steps</h2>
          <ol className="space-y-2 text-sm">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                <span>{s.replace(/^\d+\.\s*/, "")}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-6 glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Your notes</h2>
          <Button size="sm" variant="glass" onClick={saveNote} disabled={saving}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
          </Button>
        </div>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you take away? What will you ship?" rows={5} />
      </section>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <Button variant="brand" onClick={markComplete} disabled={completing || completed}>
          {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {completed ? "Completed" : "Mark complete & continue"}
        </Button>
        <div className="flex gap-2">
          {prev && (
            <Button asChild variant="glass">
              <Link to="/course/$moduleSlug/$lessonSlug" params={{ moduleSlug: module.slug, lessonSlug: prev.slug }}>
                <ArrowLeft className="h-4 w-4" /> Previous
              </Link>
            </Button>
          )}
          {next && (
            <Button asChild variant="glass">
              <Link to="/course/$moduleSlug/$lessonSlug" params={{ moduleSlug: module.slug, lessonSlug: next.slug }}>
                Next <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
