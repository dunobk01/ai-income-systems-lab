import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, ExternalLink, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  listAllPillarsAdmin,
  upsertPillar,
  deletePillar,
  togglePillarPublished,
} from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/admin/pillars")({
  head: () => ({ meta: [{ title: "Pillar Guides — Admin" }] }),
  component: AdminPillars,
});

type Listed = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  published_at: string | null;
  updated_at: string;
  created_at: string;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function AdminPillars() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const listFn = useServerFn(listAllPillarsAdmin);
  const upsertFn = useServerFn(upsertPillar);
  const delFn = useServerFn(deletePillar);
  const toggleFn = useServerFn(togglePillarPublished);

  const [pillars, setPillars] = useState<Listed[]>([]);
  const [editing, setEditing] = useState<null | {
    id?: string;
    slug: string;
    title: string;
    description: string;
    intro: string;
    cover_image_url: string;
    publish: boolean;
  }>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) void navigate({ to: "/dashboard", replace: true });
  }, [loading, isAdmin, navigate]);

  const reload = async () => {
    try {
      const r = await listFn();
      setPillars(r.pillars as Listed[]);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load pillars");
    }
  };

  useEffect(() => { if (isAdmin) void reload(); /* eslint-disable-next-line */ }, [isAdmin]);

  if (!isAdmin) return null;

  const startNew = () =>
    setEditing({ slug: "", title: "", description: "", intro: "", cover_image_url: "", publish: false });

  const startEdit = (p: Listed) =>
    setEditing({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description ?? "",
      intro: "",
      cover_image_url: "",
      publish: !!p.published_at,
    });

  const save = async () => {
    if (!editing) return;
    setBusy("save"); setErr(null); setMsg(null);
    try {
      const slug = editing.slug.trim() || slugify(editing.title);
      const res = await upsertFn({
        data: {
          id: editing.id,
          slug,
          title: editing.title.trim(),
          description: editing.description.trim() || null,
          intro: editing.intro.trim() || null,
          cover_image_url: editing.cover_image_url.trim() || null,
          publish: editing.publish,
        },
      });
      setMsg("Saved.");
      setEditing((p) => (p ? { ...p, id: res.id, slug } : p));
      await reload();
    } catch (e: any) { setErr(e?.message ?? "Save failed"); }
    finally { setBusy(null); }
  };

  const toggle = async (id: string, publish: boolean) => {
    setBusy(`t-${id}`);
    try { await toggleFn({ data: { id, publish } }); await reload(); }
    catch (e: any) { setErr(e?.message ?? "Failed"); }
    finally { setBusy(null); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this pillar? Posts stay, but lose their link.")) return;
    setBusy(`d-${id}`);
    try {
      await delFn({ data: { id } });
      if (editing?.id === id) setEditing(null);
      await reload();
    } catch (e: any) { setErr(e?.message ?? "Delete failed"); }
    finally { setBusy(null); }
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Admin
          </Link>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Pillar Guides</h1>
          <p className="text-sm text-muted-foreground mt-1">Topic hubs that tie posts into a complete guide. Great for SEO authority.</p>
        </div>
        <Button variant="brand" onClick={startNew}><Plus className="h-4 w-4" /> New pillar</Button>
      </div>

      {msg && <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{msg}</div>}
      {err && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{err}</div>}

      <div className="mt-8 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-4">
          <h2 className="font-semibold mb-3 text-sm">All pillars</h2>
          {pillars.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pillars yet.</p>
          ) : (
            <ul className="space-y-2">
              {pillars.map((p) => (
                <li key={p.id} className={`rounded-xl border border-white/5 p-3 hover:border-white/15 transition ${editing?.id === p.id ? "border-[color:var(--brand)]/40" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <button onClick={() => startEdit(p)} className="text-left flex-1">
                      <div className="font-medium text-sm">{p.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">/guides/{p.slug}</div>
                    </button>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${p.published_at ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-muted-foreground"}`}>
                      {p.published_at ? "live" : "draft"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    {p.published_at ? (
                      <>
                        <Link to="/guides/$slug" params={{ slug: p.slug }} target="_blank" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                          <ExternalLink className="h-3 w-3" /> View
                        </Link>
                        <button disabled={busy === `t-${p.id}`} onClick={() => toggle(p.id, false)} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                          <EyeOff className="h-3 w-3" /> Unpublish
                        </button>
                      </>
                    ) : (
                      <button disabled={busy === `t-${p.id}`} onClick={() => toggle(p.id, true)} className="inline-flex items-center gap-1 text-[color:var(--brand)] hover:underline">
                        <Eye className="h-3 w-3" /> Publish
                      </button>
                    )}
                    <button disabled={busy === `d-${p.id}`} onClick={() => remove(p.id)} className="ml-auto inline-flex items-center gap-1 text-red-300/80 hover:text-red-300">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3 glass rounded-2xl p-6">
          {!editing ? (
            <div className="text-sm text-muted-foreground text-center py-16">
              Pick a pillar or click <span className="text-foreground font-medium">New pillar</span> to start.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="ptitle">Title</Label>
                <Input id="ptitle" value={editing.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setEditing((p) => p ? { ...p, title, slug: p.slug || slugify(title) } : p);
                  }}
                  placeholder="Make Money With AI: The Complete Guide" />
              </div>
              <div>
                <Label htmlFor="pslug">Slug</Label>
                <Input id="pslug" value={editing.slug}
                  onChange={(e) => setEditing((p) => p ? { ...p, slug: slugify(e.target.value) } : p)}
                  placeholder="make-money-with-ai" />
                <p className="text-xs text-muted-foreground mt-1">Lives at /guides/{editing.slug || "your-slug"}. Posts opt into this pillar using this slug.</p>
              </div>
              <div>
                <Label htmlFor="pdesc">Short description (used in previews + meta)</Label>
                <Textarea id="pdesc" value={editing.description} rows={2} maxLength={500}
                  onChange={(e) => setEditing((p) => p ? { ...p, description: e.target.value } : p)} />
              </div>
              <div>
                <Label htmlFor="pintro">Intro (long — the pillar's own body content)</Label>
                <Textarea id="pintro" value={editing.intro} rows={12} maxLength={20000}
                  className="font-mono text-sm"
                  onChange={(e) => setEditing((p) => p ? { ...p, intro: e.target.value } : p)}
                  placeholder={"Open with the promise of the guide.\n\nBlank lines between paragraphs."} />
              </div>
              <div>
                <Label htmlFor="pcover">Cover image URL (optional)</Label>
                <Input id="pcover" value={editing.cover_image_url}
                  onChange={(e) => setEditing((p) => p ? { ...p, cover_image_url: e.target.value } : p)} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.publish}
                  onChange={(e) => setEditing((p) => p ? { ...p, publish: e.target.checked } : p)} />
                Publish immediately
              </label>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                <Button variant="brand" onClick={save} disabled={busy === "save"}>
                  {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save
                </Button>
                <Button variant="ghost" onClick={() => setEditing(null)}>Close</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
