import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Send, Eye, EyeOff, ExternalLink, Loader2, ArrowLeft, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  listAllPostsAdmin,
  getPostAdmin,
  upsertPost,
  deletePost,
  publishPost,
  unpublishPost,
} from "@/lib/newsletter.functions";
import { listAllPillarsAdmin } from "@/lib/blog.functions";


export const Route = createFileRoute("/_authenticated/admin/newsletter")({
  head: () => ({ meta: [{ title: "Newsletter — Admin" }] }),
  component: AdminNewsletter,
});

type Listed = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  email_sent_at: string | null;
  created_at: string;
  updated_at: string;
  post_type?: "newsletter" | "blog" | null;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function AdminNewsletter() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const listFn = useServerFn(listAllPostsAdmin);
  const getFn = useServerFn(getPostAdmin);
  const upsertFn = useServerFn(upsertPost);
  const delFn = useServerFn(deletePost);
  const pubFn = useServerFn(publishPost);
  const unpubFn = useServerFn(unpublishPost);
  const pillarsFn = useServerFn(listAllPillarsAdmin);

  const [posts, setPosts] = useState<Listed[]>([]);
  const [pillars, setPillars] = useState<Array<{ id: string; slug: string; title: string }>>([]);
  const [editing, setEditing] = useState<null | {
    id?: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    cover_image_url: string;
    tags: string[];
    pillar_slug: string;
    post_type: "newsletter" | "blog";
    seo_title: string;
    seo_description: string;
  }>(null);
  const [tagInput, setTagInput] = useState("");
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
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load posts");
    }
  };

  const reloadPillars = async () => {
    try {
      const r = await pillarsFn();
      setPillars(r.pillars.map((p: any) => ({ id: p.id, slug: p.slug, title: p.title })));
    } catch {}
  };

  useEffect(() => {
    if (isAdmin) { void reload(); void reloadPillars(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!isAdmin) return null;

  const startNew = (post_type: "newsletter" | "blog" = "newsletter") =>
    setEditing({ slug: "", title: "", excerpt: "", content: "", cover_image_url: "", tags: [], pillar_slug: "", post_type, seo_title: "", seo_description: "" });

  const startEdit = async (id: string) => {
    setErr(null);
    setMsg(null);
    try {
      const { post } = await getFn({ data: { id } });
      if (!post) return;
      setEditing({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt ?? "",
        content: post.content ?? "",
        cover_image_url: post.cover_image_url ?? "",
        tags: (post as any).tags ?? [],
        pillar_slug: (post as any).pillar_slug ?? "",
        post_type: ((post as any).post_type ?? "newsletter") as "newsletter" | "blog",
        seo_title: (post as any).seo_title ?? "",
        seo_description: (post as any).seo_description ?? "",
      });
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load post");
    }
  };

  const addTag = (raw: string) => {
    const t = raw.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    if (!t) return;
    setEditing((p) => (p && !p.tags.includes(t) ? { ...p, tags: [...p.tags, t].slice(0, 20) } : p));
    setTagInput("");
  };
  const removeTag = (t: string) => setEditing((p) => (p ? { ...p, tags: p.tags.filter((x) => x !== t) } : p));

  const save = async () => {
    if (!editing) return;
    setBusy("save");
    setErr(null);
    setMsg(null);
    try {
      const slug = editing.slug.trim() || slugify(editing.title);
      const res = await upsertFn({
        data: {
          id: editing.id,
          slug,
          title: editing.title.trim(),
          excerpt: editing.excerpt.trim() || null,
          content: editing.content,
          cover_image_url: editing.cover_image_url.trim() || null,
          tags: editing.tags,
          pillar_slug: editing.pillar_slug.trim() || null,
          post_type: editing.post_type,
        },
      });

      setMsg("Saved.");
      setEditing((p) => (p ? { ...p, id: res.id, slug } : p));
      await reload();
    } catch (e: any) {
      setErr(e?.message ?? "Save failed");
    } finally {
      setBusy(null);
    }
  };

  const publish = async (id: string, sendEmail: boolean) => {
    setBusy(`pub-${id}`);
    setErr(null);
    setMsg(null);
    try {
      const r = await pubFn({ data: { id, sendEmail } });
      setMsg(
        sendEmail
          ? r.email.ok
            ? "Published and email sent to subscribers."
            : `Published. Email skipped: ${r.email.reason}`
          : "Published (no email sent).",
      );
      await reload();
    } catch (e: any) {
      setErr(e?.message ?? "Publish failed");
    } finally {
      setBusy(null);
    }
  };

  const unpublish = async (id: string) => {
    setBusy(`unpub-${id}`);
    try {
      await unpubFn({ data: { id } });
      await reload();
    } catch (e: any) {
      setErr(e?.message ?? "Unpublish failed");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setBusy(`del-${id}`);
    try {
      await delFn({ data: { id } });
      if (editing?.id === id) setEditing(null);
      await reload();
    } catch (e: any) {
      setErr(e?.message ?? "Delete failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Admin
          </Link>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Newsletter & Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">Write newsletter issues or blog posts, publish to the site, and (for newsletters) send to your MailerLite list.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => startNew("blog")}>
            <Plus className="h-4 w-4" /> New blog post
          </Button>
          <Button variant="brand" onClick={() => startNew("newsletter")}>
            <Plus className="h-4 w-4" /> New newsletter
          </Button>
        </div>
      </div>

      {msg && <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{msg}</div>}
      {err && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{err}</div>}

      <div className="mt-8 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-4">
          <h2 className="font-semibold mb-3 text-sm">All posts</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          ) : (
            <ul className="space-y-2">
              {posts.map((p) => (
                <li key={p.id} className={`rounded-xl border border-white/5 p-3 hover:border-white/15 transition ${editing?.id === p.id ? "border-[color:var(--brand)]/40" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <button onClick={() => startEdit(p.id)} className="text-left flex-1">
                      <div className="font-medium text-sm">{p.title || "(untitled)"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">/{p.slug}</div>
                    </button>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${p.published_at ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-muted-foreground"}`}>
                        {p.published_at ? "live" : "draft"}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${p.post_type === "blog" ? "bg-sky-500/15 text-sky-300" : "bg-amber-500/15 text-amber-300"}`}>
                        {p.post_type === "blog" ? "blog" : "newsletter"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    {p.published_at ? (
                      <>
                        {p.post_type === "blog" ? (
                          <Link to="/blog/$slug" params={{ slug: p.slug }} target="_blank" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-3 w-3" /> View
                          </Link>
                        ) : (
                          <Link to="/newsletter/$slug" params={{ slug: p.slug }} target="_blank" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-3 w-3" /> View
                          </Link>
                        )}
                        <button disabled={busy === `unpub-${p.id}`} onClick={() => unpublish(p.id)} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                          <EyeOff className="h-3 w-3" /> Unpublish
                        </button>
                      </>
                    ) : p.post_type === "blog" ? (
                      <button disabled={busy === `pub-${p.id}`} onClick={() => publish(p.id, false)} className="inline-flex items-center gap-1 text-[color:var(--brand)] hover:underline">
                        {busy === `pub-${p.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />} Publish
                      </button>
                    ) : (
                      <button disabled={busy === `pub-${p.id}`} onClick={() => publish(p.id, true)} className="inline-flex items-center gap-1 text-[color:var(--brand)] hover:underline">
                        {busy === `pub-${p.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />} Publish + email
                      </button>
                    )}
                    {!p.published_at && p.post_type !== "blog" && (
                      <button disabled={busy === `pub-${p.id}`} onClick={() => publish(p.id, false)} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                        <Eye className="h-3 w-3" /> Publish only
                      </button>
                    )}
                    <button disabled={busy === `del-${p.id}`} onClick={() => remove(p.id)} className="ml-auto inline-flex items-center gap-1 text-red-300/80 hover:text-red-300">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {p.email_sent_at && <div className="mt-1 text-[10px] text-muted-foreground">Emailed {new Date(p.email_sent_at).toLocaleDateString()}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3 glass rounded-2xl p-6">
          {!editing ? (
            <div className="text-sm text-muted-foreground text-center py-16">
              Select a post on the left or click <span className="text-foreground font-medium">New post</span> to start writing.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="post_type">Post type</Label>
                <div className="mt-1 flex gap-2">
                  {(["newsletter", "blog"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditing((p) => (p ? { ...p, post_type: t } : p))}
                      className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                        editing.post_type === t
                          ? "border-[color:var(--brand)]/60 bg-[color:var(--brand)]/10 text-foreground"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {editing.post_type === "blog"
                    ? "Blog posts appear on /blog and are indexed for SEO. No email is sent."
                    : "Newsletter issues appear on /newsletter and can be emailed to your MailerLite list on publish."}
                </p>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editing.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setEditing((p) => p ? { ...p, title, slug: p.slug || slugify(title) } : p);
                  }}
                  placeholder={editing.post_type === "blog" ? "How to use AI to land your first $1k client" : "Week 1: The one prompt that doubled my Upwork replies"}
                />
              </div>
              <div>
                <Label htmlFor="slug">URL slug</Label>
                <Input
                  id="slug"
                  value={editing.slug}
                  onChange={(e) => setEditing((p) => p ? { ...p, slug: slugify(e.target.value) } : p)}
                  placeholder="your-post-slug"
                />
                <p className="text-xs text-muted-foreground mt-1">Goes live at /{editing.post_type === "blog" ? "blog" : "newsletter"}/{editing.slug || "your-slug"}</p>
              </div>
              <div>
                <Label htmlFor="excerpt">Excerpt (1–2 sentences, used as preview + email subtitle)</Label>
                <Textarea
                  id="excerpt"
                  value={editing.excerpt}
                  onChange={(e) => setEditing((p) => p ? { ...p, excerpt: e.target.value } : p)}
                  rows={2}
                  maxLength={500}
                />
              </div>
              <div>
                <Label htmlFor="cover">Cover image URL (optional)</Label>
                <Input
                  id="cover"
                  value={editing.cover_image_url}
                  onChange={(e) => setEditing((p) => p ? { ...p, cover_image_url: e.target.value } : p)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Tags (topic keywords — power /blog/tag/… pages)</Label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {editing.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                      #{t}
                      <button onClick={() => removeTag(t)} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
                  }}
                  onBlur={() => tagInput && addTag(tagInput)}
                  placeholder="Type a tag and press Enter (e.g. prompts, upwork, automation)"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="pillar">Pillar guide (optional)</Label>
                <select
                  id="pillar"
                  value={editing.pillar_slug}
                  onChange={(e) => setEditing((p) => p ? { ...p, pillar_slug: e.target.value } : p)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                >
                  <option value="">— None —</option>
                  {pillars.map((pl) => (
                    <option key={pl.id} value={pl.slug}>{pl.title} (/guides/{pl.slug})</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Attach this post to a pillar so it shows up inside that guide.{" "}
                  <Link to="/admin/pillars" className="underline">Manage pillars</Link>
                </p>
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={editing.content}
                  onChange={(e) => setEditing((p) => p ? { ...p, content: e.target.value } : p)}
                  rows={18}
                  maxLength={50000}
                  placeholder={"Write your weekly tip here.\n\nLeave a blank line between paragraphs."}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">{editing.content.length.toLocaleString()} / 50,000</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                <Button variant="brand" onClick={save} disabled={busy === "save"}>
                  {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save draft
                </Button>
                {editing.id && (
                  <Button
                    variant="outline"
                    onClick={() => publish(editing.id!, editing.post_type === "newsletter")}
                    disabled={busy === `pub-${editing.id}`}
                  >
                    <Send className="h-4 w-4" /> {editing.post_type === "blog" ? "Publish blog post" : "Publish + email subscribers"}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setEditing(null)}>Close</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {editing.post_type === "blog"
                  ? "Blog posts go live immediately on /blog after publish. No email sent."
                  : "Tip: save first, then click Publish + email when you're ready. Email is sent once per post."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
