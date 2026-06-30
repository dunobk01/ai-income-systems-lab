import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Lock, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

const TIER_RANK: Record<string, number> = { none: 0, monthly: 1, starter: 1, builder: 2, pro: 3, accelerator: 3 };

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({ meta: [{ title: "Direct Messages — AI Income Systems Lab" }] }),
  component: MessagesPage,
});

type DM = {
  id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  recipient_id: string;
  sender_id: string;
};

function MessagesPage() {
  const { user, profile, isAdmin } = useAuth();
  const tier = profile?.tier ?? "none";
  const canDM = isAdmin || (TIER_RANK[tier] ?? 0) >= 3;

  if (!canDM) {
    return (
      <div className="p-6 lg:p-10 max-w-3xl mx-auto">
        <div className="glass-strong rounded-3xl p-10 text-center">
          <div className="mx-auto h-14 w-14 grid place-items-center rounded-2xl mb-4" style={{ background: "var(--gradient-soft)" }}>
            <Lock className="h-6 w-6 text-[color:var(--brand)]" />
          </div>
          <h1 className="text-2xl font-bold">Direct messages are an Accelerator perk</h1>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Upgrade to Accelerator to message other members 1:1. You'll keep all community and curriculum access too.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="brand"><Link to="/pricing">See Accelerator</Link></Button>
            <Button asChild variant="glass"><Link to="/community">Back to community</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return <DMInbox userId={user!.id} />;
}

function DMInbox({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<DM[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("direct_messages")
      .select("*")
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) setErr(error.message);
    else setMessages((data ?? []) as DM[]);
    setLoading(false);
  }

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [userId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const threads = useMemo(() => {
    const map = new Map<string, DM[]>();
    for (const m of messages) {
      const other = m.sender_id === userId ? m.recipient_id : m.sender_id;
      const arr = map.get(other) ?? [];
      arr.push(m);
      map.set(other, arr);
    }
    return [...map.entries()].sort((a, b) =>
      (b[1].at(-1)?.created_at ?? "").localeCompare(a[1].at(-1)?.created_at ?? "")
    );
  }, [messages, userId]);

  const [activeOther, setActiveOther] = useState<string | null>(null);
  useEffect(() => {
    if (!activeOther && threads.length) setActiveOther(threads[0][0]);
  }, [threads, activeOther]);

  const activeMessages = activeOther ? (threads.find((t) => t[0] === activeOther)?.[1] ?? []) : [];

  async function send() {
    const r = (activeOther ?? recipient).trim();
    if (!r || !body.trim()) return;
    setSending(true);
    setErr(null);
    const { error } = await supabase.from("direct_messages").insert({
      sender_id: userId,
      recipient_id: r,
      body: body.trim(),
    });
    setSending(false);
    if (error) { setErr(error.message); return; }
    setBody("");
    if (!activeOther) { setActiveOther(r); setRecipient(""); }
    await load();
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <Link to="/community" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to community
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Direct messages</h1>
      <p className="mt-1 text-sm text-muted-foreground">Accelerator member-to-member DMs. Be respectful — no spam, no pitching.</p>

      <div className="mt-6 grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="glass rounded-2xl p-3 h-fit">
          <p className="px-2 py-1 text-xs uppercase tracking-wider text-muted-foreground">Conversations</p>
          {loading && <p className="px-2 py-3 text-xs text-muted-foreground">Loading…</p>}
          {!loading && threads.length === 0 && (
            <p className="px-2 py-3 text-xs text-muted-foreground">No conversations yet. Start one →</p>
          )}
          <ul className="mt-1 space-y-1">
            {threads.map(([other, msgs]) => (
              <li key={other}>
                <button
                  onClick={() => setActiveOther(other)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${activeOther === other ? "bg-white/10" : "hover:bg-white/5"}`}
                >
                  <div className="font-medium truncate">{other.slice(0, 8)}…</div>
                  <div className="text-xs text-muted-foreground truncate">{msgs.at(-1)?.body}</div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="glass-strong rounded-2xl flex flex-col min-h-[480px]">
          {!activeOther ? (
            <div className="p-5 border-b border-white/5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Start a new conversation</p>
              <Input
                placeholder="Recipient user ID"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              <p className="mt-2 text-[11px] text-muted-foreground">Tip: grab a member's user ID from a community post URL.</p>
            </div>
          ) : (
            <div className="p-4 border-b border-white/5 text-sm font-medium truncate">
              Conversation with <span className="text-[color:var(--brand-2)]">{activeOther}</span>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeMessages.map((m) => (
              <div key={m.id} className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.sender_id === userId ? "ml-auto bg-[color:var(--brand)]/20" : "bg-white/5"}`}>
                {m.body}
                <div className="mt-1 text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
              </div>
            ))}
            {activeMessages.length === 0 && activeOther && (
              <p className="text-xs text-muted-foreground text-center py-8">No messages yet — say hi 👋</p>
            )}
          </div>

          {err && <div className="px-4 pb-2 text-xs text-red-300">{err}</div>}

          <div className="p-3 border-t border-white/5 flex gap-2">
            <Input
              placeholder="Write a message…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
            />
            <Button variant="brand" onClick={() => void send()} disabled={sending || !body.trim() || (!activeOther && !recipient.trim())}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
