import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { listCourseAdmin, saveModule, deleteModule, saveLesson, deleteLesson } from "@/lib/course-admin.functions";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/course")({
  head: () => ({ meta: [{ title: "Course editor — Admin" }, { name: "robots", content: "noindex" }] }),
  component: CourseAdmin,
});

const TIERS = ["none", "monthly", "starter", "builder", "pro", "accelerator"] as const;
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const input = "w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm";

function CourseAdmin() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const list = useServerFn(listCourseAdmin);
  const [data, setData] = useState<any>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [editMod, setEditMod] = useState<any>(null);
  const [editLes, setEditLes] = useState<any>(null);

  useEffect(() => { if (!loading && !isAdmin) void navigate({ to: "/dashboard", replace: true }); }, [loading, isAdmin, navigate]);
  const reload = () => list().then(setData).catch((e) => toast.error(e.message));
  useEffect(() => { if (isAdmin) void reload(); }, [isAdmin]);

  const delMod = useServerFn(deleteModule);
  const delLes = useServerFn(deleteLesson);

  if (!isAdmin) return null;
  const course = data?.courses?.[0];

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <h1 className="text-3xl font-black tracking-tight">Course editor</h1>
      <p className="text-sm text-muted-foreground mt-1">Add, edit, reorder, or delete modules and lessons.</p>
      <button
        disabled={!course}
        onClick={() => setEditMod({ course_id: course.id, title: "", slug: "", summary: "", order_index: (data.modules.length ?? 0) + 1, required_tier: "starter", is_preview: false })}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold disabled:opacity-50"
      ><Plus className="h-4 w-4" /> New module</button>

      {!data && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      <div className="mt-6 space-y-3">
        {data?.modules.map((m: any) => {
          const lessons = data.lessons.filter((l: any) => l.module_id === m.id);
          return (
            <div key={m.id} className="glass rounded-2xl">
              <div className="flex items-center gap-2 p-4">
                <button onClick={() => setOpen((o) => ({ ...o, [m.id]: !o[m.id] }))} aria-label="Toggle lessons" className="p-1">
                  {open[m.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{m.order_index}. {m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.required_tier}{m.is_preview ? " · preview" : ""} · {lessons.length} lessons</div>
                </div>
                <button onClick={() => setEditMod({ ...m, summary: m.summary ?? "" })} aria-label="Edit module" className="p-2 hover:bg-white/10 rounded-lg"><Pencil className="h-4 w-4" /></button>
                <button
                  aria-label="Delete module"
                  className="p-2 hover:bg-white/10 rounded-lg text-destructive"
                  onClick={async () => {
                    if (!confirm(`Delete module "${m.title}" and its ${lessons.length} lessons? This can't be undone.`)) return;
                    try { await delMod({ data: { id: m.id } }); toast.success("Module deleted"); reload(); } catch (e: any) { toast.error(e.message); }
                  }}
                ><Trash2 className="h-4 w-4" /></button>
              </div>
              {open[m.id] && (
                <div className="border-t border-white/10 p-4 space-y-2">
                  {lessons.map((l: any) => (
                    <div key={l.id} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 truncate">{l.order_index}. {l.title}{l.is_preview ? " · preview" : ""}</span>
                      <button onClick={() => setEditLes(l)} aria-label="Edit lesson" className="p-2 hover:bg-white/10 rounded-lg"><Pencil className="h-4 w-4" /></button>
                      <button
                        aria-label="Delete lesson"
                        className="p-2 hover:bg-white/10 rounded-lg text-destructive"
                        onClick={async () => {
                          if (!confirm(`Delete lesson "${l.title}"?`)) return;
                          try { await delLes({ data: { id: l.id } }); toast.success("Lesson deleted"); reload(); } catch (e: any) { toast.error(e.message); }
                        }}
                      ><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditLes({ module_id: m.id, title: "", slug: "", content: "", action_steps: "", video_url: "", resource_url: "", duration_minutes: null, order_index: lessons.length + 1, is_preview: false })}
                    className="inline-flex items-center gap-1 text-sm text-primary mt-2"
                  ><Plus className="h-4 w-4" /> Add lesson</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editMod && <ModuleForm value={editMod} onClose={() => setEditMod(null)} onSaved={() => { setEditMod(null); reload(); }} />}
      {editLes && <LessonForm value={editLes} onClose={() => setEditLes(null)} onSaved={() => { setEditLes(null); reload(); }} />}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-start justify-center overflow-y-auto p-4" onClick={onClose}>
      <div className="glass rounded-2xl p-6 w-full max-w-2xl my-8 bg-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm space-y-1"><span className="text-muted-foreground">{label}</span>{children}</label>;
}

function ModuleForm({ value, onClose, onSaved }: any) {
  const save = useServerFn(saveModule);
  const [v, setV] = useState<any>(value);
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={v.id ? "Edit module" : "New module"} onClose={onClose}>
      <form className="space-y-3" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true);
        try {
          await save({ data: { id: v.id, course_id: v.course_id, title: v.title, slug: v.slug || slugify(v.title), summary: v.summary ?? "", order_index: Number(v.order_index) || 0, required_tier: v.required_tier, is_preview: !!v.is_preview } });
          toast.success("Module saved"); onSaved();
        } catch (err: any) { toast.error(err.message); } finally { setBusy(false); }
      }}>
        <Field label="Title"><input required className={input} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value, slug: v.id ? v.slug : slugify(e.target.value) })} /></Field>
        <Field label="Slug"><input required className={input} value={v.slug} onChange={(e) => setV({ ...v, slug: e.target.value })} /></Field>
        <Field label="Summary"><textarea rows={3} className={input} value={v.summary} onChange={(e) => setV({ ...v, summary: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Order"><input type="number" className={input} value={v.order_index} onChange={(e) => setV({ ...v, order_index: e.target.value })} /></Field>
          <Field label="Required tier">
            <select className={input} value={v.required_tier} onChange={(e) => setV({ ...v, required_tier: e.target.value })}>
              {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!v.is_preview} onChange={(e) => setV({ ...v, is_preview: e.target.checked })} /> Free preview (anyone signed in can open)</label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-sm">Cancel</button>
          <button disabled={busy} className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
}

function LessonForm({ value, onClose, onSaved }: any) {
  const save = useServerFn(saveLesson);
  const [v, setV] = useState<any>({ ...value, content: value.content ?? "", action_steps: value.action_steps ?? "", video_url: value.video_url ?? "", resource_url: value.resource_url ?? "" });
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={v.id ? "Edit lesson" : "New lesson"} onClose={onClose}>
      <form className="space-y-3" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true);
        try {
          await save({ data: {
            id: v.id, module_id: v.module_id, title: v.title, slug: v.slug || slugify(v.title),
            content: v.content, action_steps: v.action_steps, video_url: v.video_url, resource_url: v.resource_url,
            duration_minutes: v.duration_minutes === "" || v.duration_minutes == null ? null : Number(v.duration_minutes),
            order_index: Number(v.order_index) || 0, is_preview: !!v.is_preview,
          } });
          toast.success("Lesson saved"); onSaved();
        } catch (err: any) { toast.error(err.message); } finally { setBusy(false); }
      }}>
        <Field label="Title"><input required className={input} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value, slug: v.id ? v.slug : slugify(e.target.value) })} /></Field>
        <Field label="Slug"><input required className={input} value={v.slug} onChange={(e) => setV({ ...v, slug: e.target.value })} /></Field>
        <Field label="Lesson content"><textarea rows={10} className={`${input} font-mono`} value={v.content} onChange={(e) => setV({ ...v, content: e.target.value })} /></Field>
        <Field label="Action steps"><textarea rows={4} className={input} value={v.action_steps} onChange={(e) => setV({ ...v, action_steps: e.target.value })} /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Video URL"><input className={input} value={v.video_url} onChange={(e) => setV({ ...v, video_url: e.target.value })} /></Field>
          <Field label="Resource URL"><input className={input} value={v.resource_url} onChange={(e) => setV({ ...v, resource_url: e.target.value })} /></Field>
          <Field label="Duration (minutes)"><input type="number" className={input} value={v.duration_minutes ?? ""} onChange={(e) => setV({ ...v, duration_minutes: e.target.value })} /></Field>
          <Field label="Order"><input type="number" className={input} value={v.order_index} onChange={(e) => setV({ ...v, order_index: e.target.value })} /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!v.is_preview} onChange={(e) => setV({ ...v, is_preview: e.target.checked })} /> Free preview lesson</label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-sm">Cancel</button>
          <button disabled={busy} className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
}
