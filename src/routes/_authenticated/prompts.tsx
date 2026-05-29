import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Copy, Search, Star, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Tier = "starter" | "builder" | "pro";
type Prompt = {
  id: string; title: string; category: string; tool: string;
  use_case: string | null; prompt_text: string; required_tier: Tier;
};

const tierRank: Record<string, number> = { none: 0, starter: 1, builder: 2, pro: 3 };

export const Route = createFileRoute("/_authenticated/prompts")({
  head: () => ({ meta: [{ title: "Prompt Library — AI Income Systems Lab" }] }),
  component: PromptsPage,
});

function PromptsPage() {
  const { user, profile } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [tool, setTool] = useState<string>("All");
  const [category, setCategory] = useState<string>("All");
  const [onlySaved, setOnlySaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data, error: err } = await supabase.from("prompts").select("*").order("category");
        if (err) throw err;
        setPrompts((data ?? []) as Prompt[]);
        if (user) {
          const { data: favs } = await supabase.from("saved_prompts").select("id, prompt_id").eq("user_id", user.id);
          const ids: Record<string, string> = {};
          (favs ?? []).forEach((f) => { ids[f.prompt_id] = f.id; });
          setSavedIds(ids);
          setSaved(new Set(Object.keys(ids)));
        }
      } catch (e) { setError((e as Error).message); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const tools = useMemo(() => ["All", ...Array.from(new Set(prompts.map((p) => p.tool)))], [prompts]);
  const cats = useMemo(() => ["All", ...Array.from(new Set(prompts.map((p) => p.category)))], [prompts]);

  const userRank = tierRank[profile?.tier ?? "none"];

  const filtered = prompts.filter((p) => {
    if (onlySaved && !saved.has(p.id)) return false;
    if (tool !== "All" && p.tool !== tool) return false;
    if (category !== "All" && p.category !== category) return false;
    if (q && !`${p.title} ${p.use_case} ${p.prompt_text}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const toggleSave = async (p: Prompt) => {
    if (!user) return;
    if (saved.has(p.id)) {
      const id = savedIds[p.id];
      const { error: err } = await supabase.from("saved_prompts").delete().eq("id", id);
      if (err) { toast.error(err.message); return; }
      const ns = new Set(saved); ns.delete(p.id); setSaved(ns);
      const ni = { ...savedIds }; delete ni[p.id]; setSavedIds(ni);
    } else {
      const { data, error: err } = await supabase.from("saved_prompts").insert({ user_id: user.id, prompt_id: p.id }).select("id").single();
      if (err) { toast.error(err.message); return; }
      const ns = new Set(saved); ns.add(p.id); setSaved(ns);
      setSavedIds({ ...savedIds, [p.id]: data.id });
    }
  };

  const copy = async (p: Prompt) => {
    await navigator.clipboard.writeText(p.prompt_text);
    toast.success("Prompt copied");
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Prompt library</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold">Battle-tested <span className="text-gradient">prompts</span></h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">Plug-and-play prompts for ChatGPT, Claude, and Perplexity. Copy, customize, ship.</p>
      </div>

      <div className="mt-6 glass rounded-2xl p-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search prompts…" className="pl-9" />
        </div>
        <select value={tool} onChange={(e) => setTool(e.target.value)} className="bg-background/50 border border-white/10 rounded-md text-sm px-3 py-2">
          {tools.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-background/50 border border-white/10 rounded-md text-sm px-3 py-2">
          {cats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button variant={onlySaved ? "brand" : "glass"} size="sm" onClick={() => setOnlySaved((v) => !v)}>
          <Star className="h-4 w-4" /> Saved
        </Button>
      </div>

      {error && <div className="mt-4 glass rounded-2xl p-4 text-sm text-red-300">{error}</div>}
      {loading && <div className="mt-8 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading prompts…</div>}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filtered.map((p) => {
          const locked = userRank < tierRank[p.required_tier];
          const isSaved = saved.has(p.id);
          return (
            <article key={p.id} className="glass rounded-2xl p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="border-white/15 text-[10px] uppercase">{p.tool}</Badge>
                    <Badge variant="outline" className="border-white/15 text-[10px] uppercase">{p.category}</Badge>
                    <Badge variant="outline" className="border-white/15 text-[10px] uppercase">{p.required_tier}</Badge>
                  </div>
                  <h3 className="mt-2 font-semibold">{p.title}</h3>
                  {p.use_case && <p className="text-xs text-muted-foreground mt-1">{p.use_case}</p>}
                </div>
                <button onClick={() => toggleSave(p)} aria-label="Save prompt" className="shrink-0 p-1.5 rounded-md hover:bg-white/10">
                  <Star className={`h-4 w-4 ${isSaved ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                </button>
              </div>
              {locked ? (
                <div className="mt-4 rounded-lg bg-white/5 p-4 text-sm text-muted-foreground flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Unlock with {p.required_tier} tier</span>
                  <Link to="/pricing" className="text-[color:var(--brand)] hover:underline text-xs">Upgrade →</Link>
                </div>
              ) : (
                <>
                  <pre className="mt-3 text-xs bg-black/30 rounded-lg p-3 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-foreground/80">{p.prompt_text}</pre>
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" variant="glass" onClick={() => copy(p)}><Copy className="h-3 w-3" /> Copy</Button>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="mt-10 glass rounded-2xl p-10 text-center text-sm text-muted-foreground">No prompts match those filters.</div>
      )}
    </div>
  );
}
