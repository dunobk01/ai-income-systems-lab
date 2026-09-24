import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  listLabPostsAdmin,
  getLabPostAdmin,
  saveLabPost,
  deleteLabPost,
} from "@/lib/lab-admin.functions";

export const Route = createFileRoute("/_authenticated/admin/lab")({
  head: () => ({ meta: [{ title: "The Lab editor — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminLab,
});

type Listed = { id: string; slug: string; title: string; published_at: string | null; updated_at: string };
type Form = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  pain_point: string;
  problem_solved: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  time_to_implement: string;
  audience: string;
  tools_used: string;
  tags: string;
  cover_image_url: string;
  seo_title: string;
  seo_description: string;
  published: boolean;
};

const EMPTY: Form = {
  slug: "", title: "", excerpt: "", content: "", pain_point: "", problem_solved: "",
  difficulty: "beginner", time_to_implement: "", audience: "", tools_used: "", tags: "",
  cover_image_url: "", seo_title: "", seo_description: "", published: false,
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const splitList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function AdminLab() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const listFn = useServerFn(listLabPostsAdmin);
  const getFn = useServerFn(getLabPostAdmin);
  const saveFn = useServerFn(saveLabPost);
  const delFn = useServerFn(deleteLabPost);

  const [posts, setPosts] = useState<Listed[]>([]);
  const [form, setForm] = useState<Form | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) void navigate({ to: "/dashboard", replace: true });
  }, [loading, isAdmin, navigate]);

  const reload = async () => {
    try {
      const r = await listFn();
      setPosts(r.posts as Listed[]);
    } catch (e) {
      setErr((e as Error).message);
    }
  };
  useEffect(() => {
    if (isAdmin) void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const openPost = async (id: string) => {
    setErr(null); setMsg(null); setBusy("load");
    try {
      const { post: p } = await getFn({ data: { id } });
      setForm({
        id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt ?? "", content: p.content ?? "",
        pain_point: p.pain_point ?? "", problem_solved: p.problem_solved ?? "",
        difficulty: (p.difficulty ?? "beginner") as Form["difficulty"],
        time_to_implement: p.time_to_implement ?? "", audience: (p.audience ?? []).join(", "),
        tools_used: (p.tools_used ?? []).join(", "), tags: (p.tags ?? []).join(", "),
        cover_image_url: p.cover_image_url ?? "", seo_title: p.seo_title ?? "",
        seo_description: p.seo_description ?? "", published: !!p.published_at,
      });
      setSlugTouched(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const save = async (publish: boolean) => {
    if (!form || busy) return;
    setErr(null); setMsg(null); setBusy(publish ? "publish" : "draft");
    try {
      const { post } = await saveFn({
        data: {
          id: form.id, slug: form.slug, title: form.title, excerpt: form.excerpt, content: form.content,
          pain_point: form.pain_point, problem_solved: form.problem_solved, difficulty: form.difficulty,
          time_to_implement: form.time_to_implement, audience: splitList(form.audience),
          tools_used: splitList(form.tools_used), tags: splitList(form.tags),
          cover_image_url: form.cover_image_url.trim(), seo_title: form.seo_title,
          seo_description: form.seo_description, publish,
        },
      });
      setForm((f) => (f ? { ...f, id: post.id, published: !!post.published_at } : f));
      setMsg(publish ? "Published — it's live on The Lab." : "Saved as draft (not visible publicly).");
      void reload();
    } catch (e) {
      const m = (e as Error).message;
      setErr(m.startsWith("[") ? "Please check the required fields (title, slug, content, and URL format)." : m);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this build permanently?")) return;
    setBusy("delete");
    try {
      await delFn({ data: { id } });
      setForm(null);
      setMsg("Deleted.");
      void reload();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  if (loading || !isAdmin) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Admin
          </Link>
          <h1 className="mt-1 font-display text-2xl font-semibold">The Lab editor</h1>
        </div>
        {!form && (
          <Button onClick={() => { setForm({ ...EMPTY }); setSlugTouched(false); setMsg(null); setErr(null); }}>
            <Plus className="mr-1 h-4 w-4" /> New build
          </Button>
        )}
      </div>

      {msg && <p role="status" className="mb-4 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm">{msg}</p>}
      {err && <p role="alert" className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}

      {!form ? (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {posts.length === 0 && <li className="p-4 text-sm text-muted-foreground">No builds yet.</li>}
          {posts.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <button className="min-w-0 text-left" onClick={() => void openPost(p.id)}>
                <div className="truncate font-medium hover:underline">{p.title}</div>
                <div className="text-xs text-muted-foreground">
                  /thelab/{p.slug} · {p.published_at ? `Published ${new Date(p.published_at).toLocaleDateString()}` : "Draft"}
                </div>
              </button>
              {p.published_at && (
                <a href={`/thelab/${p.slug}`} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                  <ExternalLink className="h-4 w-4" /><span className="sr-only">View</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void save(true); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" required value={form.title} onChange={(e) => {
                set("title", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }} />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" required value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
            </div>
          </div>
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" rows={2} maxLength={500} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="content">Content * <span className="font-normal text-muted-foreground">(markdown, or HTML starting with &lt;div class="lab-post"&gt;)</span></Label>
            <Textarea id="content" required rows={18} className="font-mono text-sm" value={form.content} onChange={(e) => set("content", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pain">Pain point</Label>
              <Input id="pain" value={form.pain_point} onChange={(e) => set("pain_point", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="solved">Problem solved</Label>
              <Input id="solved" value={form.problem_solved} onChange={(e) => set("problem_solved", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <select id="difficulty" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.difficulty} onChange={(e) => set("difficulty", e.target.value as Form["difficulty"])}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <Label htmlFor="time">Time to implement</Label>
              <Input id="time" placeholder="e.g. 45 min" value={form.time_to_implement} onChange={(e) => set("time_to_implement", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tools">Tools used (comma separated)</Label>
              <Input id="tools" value={form.tools_used} onChange={(e) => set("tools_used", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="audience">Audience (comma separated)</Label>
              <Input id="audience" value={form.audience} onChange={(e) => set("audience", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cover">Cover image URL</Label>
              <Input id="cover" type="url" value={form.cover_image_url} onChange={(e) => set("cover_image_url", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="seot">SEO title ({form.seo_title.length}/70)</Label>
              <Input id="seot" maxLength={70} value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="seod">SEO description ({form.seo_description.length}/200)</Label>
              <Input id="seod" maxLength={200} value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <Button type="submit" disabled={!!busy}>
              {busy === "publish" && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {form.published ? "Update live post" : "Publish"}
            </Button>
            <Button type="button" variant="outline" disabled={!!busy} onClick={() => void save(false)}>
              {busy === "draft" && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {form.published ? "Unpublish (save as draft)" : "Save draft"}
            </Button>
            {form.published && (
              <a href={`/thelab/${form.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                View live <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <div className="ml-auto flex gap-2">
              {form.id && (
                <Button type="button" variant="ghost" disabled={!!busy} onClick={() => void remove(form.id!)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={() => { setForm(null); setMsg(null); setErr(null); }}>Close</Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
