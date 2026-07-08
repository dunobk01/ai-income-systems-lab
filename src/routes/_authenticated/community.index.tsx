import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquare, Heart, Pin, Plus, Loader2, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { listThreads, createThread } from "@/lib/community.functions";

export const Route = createFileRoute("/_authenticated/community/")({
  head: () => ({
    meta: [
      { title: "The Lab — AI Income Systems" },
      { name: "description", content: "The Lab is the members-only community — share wins, post workflows, and get peer feedback from other AI Income Systems builders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CommunityIndex,
});

const CATS = [
  { value: "general", label: "General" },
  { value: "wins", label: "Wins 🎉" },
  { value: "workflows", label: "Workflows" },
  { value: "feedback", label: "Feedback" },
  { value: "help", label: "Help" },
] as const;

const TIER_RANK: Record<string, number> = { none: 0, monthly: 1, starter: 1, builder: 2, pro: 3, accelerator: 3 };

function CommunityIndex() {
  const { profile, isAdmin } = useAuth();
  const tier = profile?.tier ?? "none";
  const canAccess = isAdmin || (TIER_RANK[tier] ?? 0) >= 1;
  const canDM = isAdmin || (TIER_RANK[tier] ?? 0) >= 3; // Accelerator/Pro only

  if (!canAccess) return <Gate />;

  return <CommunityFeed canDM={canDM} />;
}

function Gate() {
  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="glass-strong rounded-3xl p-10 text-center">
        <div className="mx-auto h-14 w-14 grid place-items-center rounded-2xl mb-4" style={{ background: "var(--gradient-soft)" }}>
          <Lock className="h-6 w-6 text-[color:var(--brand)]" />
        </div>
        <h1 className="text-2xl font-bold">Community is for paying members</h1>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          The members-only community is where builders share wins, post real workflows, and get peer feedback. Subscribe to Starter, Builder, or Accelerator to join the conversation.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="brand"><Link to="/pricing">See plans <ArrowRight className="h-4 w-4" /></Link></Button>
          <Button asChild variant="glass"><Link to="/dashboard">Back to dashboard</Link></Button>
        </div>
      </div>
    </div>
  );
}

function CommunityFeed({ canDM }: { canDM: boolean }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<typeof CATS[number]["value"]>("general");

  const threads = useQuery({ queryKey: ["community-threads"], queryFn: () => listFn() });

  const create = useMutation({
    mutationFn: () => createFn({ data: { title, body, category } }),
    onSuccess: () => {
      setTitle(""); setBody(""); setCategory("general"); setComposerOpen(false);
      void qc.invalidateQueries({ queryKey: ["community-threads"] });
    },
  });

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-2)]">Members-only</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">The Lab</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Share wins, post workflows, get peer feedback. Open to all paying members.
          </p>
        </div>
        <div className="flex gap-2">
          {canDM && (
            <Button asChild variant="glass">
              <Link to="/messages"><MessageSquare className="h-4 w-4" /> DMs</Link>
            </Button>
          )}
          <Button variant="brand" onClick={() => setComposerOpen((v) => !v)}>
            <Plus className="h-4 w-4" /> New post
          </Button>
        </div>
      </div>

      {!canDM && (
        <div className="mb-6 glass rounded-2xl px-4 py-3 text-xs text-muted-foreground flex items-center justify-between flex-wrap gap-2">
          <span>💬 Direct messages between members are an <span className="text-[color:var(--brand-2)] font-semibold">Accelerator</span> perk.</span>
          <Link to="/pricing" className="text-[color:var(--brand)] hover:underline">Upgrade →</Link>
        </div>
      )}


      {composerOpen && (
        <div className="glass-strong rounded-2xl p-5 mb-8">
          <div className="grid gap-3">
            <Input placeholder="Title (e.g., How I closed my first $5k AI client)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Share the details. Be specific — what worked, what didn't, what you'd do next time." value={body} onChange={(e) => setBody(e.target.value)} rows={6} />
            <div className="flex flex-wrap gap-2">
              {CATS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    category === c.value ? "border-[color:var(--brand)] bg-[color:var(--brand)]/15 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="glass" onClick={() => setComposerOpen(false)}>Cancel</Button>
              <Button
                variant="brand"
                disabled={create.isPending || title.trim().length < 3 || body.trim().length < 1}
                onClick={() => create.mutate()}
              >
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
              </Button>
            </div>
            {create.isError && (
              <p className="text-sm text-red-400">{(create.error as Error)?.message ?? "Failed to post"}</p>
            )}
          </div>
        </div>
      )}

      {threads.isLoading && (
        <div className="glass rounded-2xl p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 mx-auto animate-spin" /></div>
      )}
      {threads.isError && (
        <div className="glass rounded-2xl p-6 text-sm text-red-400">Couldn't load threads. {(threads.error as Error)?.message}</div>
      )}

      {threads.data && threads.data.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center">
          <h3 className="font-semibold">Be the first to post 👋</h3>
          <p className="mt-1 text-sm text-muted-foreground">Share a win, drop a workflow, or ask for feedback on what you're building.</p>
        </div>
      )}

      <div className="grid gap-3">
        {threads.data?.map((t) => (
          <Link
            key={t.id}
            to="/community/$threadId"
            params={{ threadId: t.id }}
            className="glass hover:bg-white/8 transition rounded-2xl p-5 flex items-start gap-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {t.pinned && <Pin className="h-3.5 w-3.5 text-[color:var(--brand-2)]" />}
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{t.category}</Badge>
                <span className="text-xs text-muted-foreground">by {t.author}</span>
                <span className="text-xs text-muted-foreground">· {timeAgo(t.last_activity_at)}</span>
              </div>
              <h3 className="mt-2 font-semibold leading-snug">{t.title}</h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
              <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {t.likes}</span>
              <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {t.replies}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
