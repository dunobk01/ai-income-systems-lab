import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy, Plus, Loader2, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { listWins, createWin, deleteWin } from "@/lib/wins.functions";

export const Route = createFileRoute("/_authenticated/wins")({
  head: () => ({
    meta: [
      { title: "Wall of Wins — AI Income Systems Lab" },
      { name: "description", content: "Revenue milestones from AI Income Systems members." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WinsPage,
});

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function WinsPage() {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const listFn = useServerFn(listWins);
  const createFn = useServerFn(createWin);
  const deleteFn = useServerFn(deleteWin);

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [system, setSystem] = useState("");
  const [note, setNote] = useState("");

  const wins = useQuery({ queryKey: ["wins"], queryFn: () => listFn() });

  const create = useMutation({
    mutationFn: () => createFn({ data: { amount: Number(amount), system, note: note || undefined } }),
    onSuccess: () => {
      setAmount(""); setSystem(""); setNote(""); setOpen(false);
      void qc.invalidateQueries({ queryKey: ["wins"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wins"] }),
  });

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-2)]">Members-only</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
            <Trophy className="h-8 w-8 text-[color:var(--brand-2)]" /> Wall of Wins
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Real revenue milestones from members. Every dollar earned with an AI Income System belongs here.
          </p>
        </div>
        <Button variant="brand" onClick={() => setOpen((v) => !v)}>
          <Plus className="h-4 w-4" /> Post a win
        </Button>
      </div>

      {wins.data && (
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          <div className="glass-strong rounded-2xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total member revenue</p>
            <p className="mt-1 text-3xl font-bold">{fmt(wins.data.total)}</p>
          </div>
          <div className="glass-strong rounded-2xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Wins posted</p>
            <p className="mt-1 text-3xl font-bold">{wins.data.count}</p>
          </div>
        </div>
      )}

      {open && (
        <div className="glass-strong rounded-2xl p-5 mb-8 grid gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                placeholder="Amount (USD)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
              />
            </div>
            <Input
              placeholder="System (e.g., Cold Start, Digital Product Machine)"
              value={system}
              onChange={(e) => setSystem(e.target.value)}
            />
          </div>
          <Textarea
            placeholder="What happened? (optional — one sentence is enough)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-end gap-2">
            <Button variant="glass" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="brand"
              disabled={create.isPending || !amount || Number(amount) <= 0 || system.trim().length < 1}
              onClick={() => create.mutate()}
            >
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post win"}
            </Button>
          </div>
          {create.isError && (
            <p className="text-sm text-red-400">{(create.error as Error)?.message ?? "Failed to post"}</p>
          )}
        </div>
      )}

      {wins.isLoading && (
        <div className="glass rounded-2xl p-8 text-center">
          <Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
        </div>
      )}
      {wins.isError && (
        <div className="glass rounded-2xl p-6 text-sm text-red-400">
          Couldn't load wins. {(wins.error as Error)?.message}
        </div>
      )}
      {wins.data && wins.data.wins.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center">
          <h3 className="font-semibold">Be the first win on the wall 🏆</h3>
          <p className="mt-1 text-sm text-muted-foreground">Made your first dollar with an AI system? Post it.</p>
        </div>
      )}

      <div className="grid gap-3">
        {wins.data?.wins.map((w) => {
          const mine = w.author_id === user?.id;
          return (
            <div key={w.id} className="glass rounded-2xl p-5 flex items-start gap-4">
              <div className="grid place-items-center h-12 w-12 rounded-xl shrink-0" style={{ background: "var(--gradient-soft)" }}>
                <Trophy className="h-5 w-5 text-[color:var(--brand-2)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl font-bold text-[color:var(--brand-2)]">{fmt(w.amount)}</span>
                  <span className="text-sm font-medium">{w.system}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {w.author} · {timeAgo(w.created_at)}
                </p>
                {w.note && <p className="mt-2 text-sm text-muted-foreground">{w.note}</p>}
              </div>
              {(mine || isAdmin) && (
                <button
                  onClick={() => { if (confirm("Delete this win?")) remove.mutate(w.id); }}
                  className="text-muted-foreground hover:text-red-400 transition p-1"
                  aria-label="Delete win"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
