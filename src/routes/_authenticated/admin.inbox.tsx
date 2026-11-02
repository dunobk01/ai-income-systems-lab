import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Inbox, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  deleteContactMessage,
  getContactMessageAdmin,
  listContactMessages,
  sendContactReply,
  setContactStatus,
} from "@/lib/contact.functions";

export const Route = createFileRoute("/_authenticated/admin/inbox")({
  head: () => ({ meta: [{ title: "Inbox — Admin" }, { name: "robots", content: "noindex" }] }),
  component: InboxPage,
});

type Row = Awaited<ReturnType<typeof listContactMessages>>[number];
type Detail = Awaited<ReturnType<typeof getContactMessageAdmin>>;

const STATUS_STYLE: Record<string, string> = {
  new: "bg-primary/20 text-primary",
  open: "bg-white/10",
  replied: "bg-emerald-500/15 text-emerald-300",
  closed: "bg-white/5 text-muted-foreground",
};

function InboxPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const list = useServerFn(listContactMessages);
  const get = useServerFn(getContactMessageAdmin);
  const reply = useServerFn(sendContactReply);
  const setStatus = useServerFn(setContactStatus);
  const del = useServerFn(deleteContactMessage);

  const [rows, setRows] = useState<Row[] | null>(null);
  const [filter, setFilter] = useState("active");
  const [selected, setSelected] = useState<Detail | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [loading, isAdmin]);

  const refresh = () => list().then(setRows).catch((e) => setErr(e?.message ?? "Failed to load"));
  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin]);

  const shown = useMemo(
    () => (rows ?? []).filter((r) => filter === "all" || (filter === "active" ? r.status !== "closed" : r.status === filter)),
    [rows, filter],
  );
  const newCount = (rows ?? []).filter((r) => r.status === "new").length;

  async function open(id: string) {
    setNote(null);
    setBody("");
    setSelected(await get({ data: { id } }));
    refresh();
  }

  async function sendReply() {
    if (!selected || !body.trim() || busy) return;
    setBusy(true);
    setNote(null);
    try {
      const r = await reply({ data: { id: selected.id, body } });
      setNote(
        r.emailStatus === "sent" ? "Reply emailed." :
        r.emailStatus === "suppressed" ? "Saved, but this person has unsubscribed or bounced, so no email was sent." :
        "Saved, but the email failed to send. Try again shortly.",
      );
      setBody("");
      setSelected(await get({ data: { id: selected.id } }));
      refresh();
    } catch (e: any) {
      setNote(e?.message ?? "Could not send reply");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status: string) {
    if (!selected) return;
    await setStatus({ data: { id: selected.id, status } });
    setSelected({ ...selected, status });
    refresh();
  }

  async function remove() {
    if (!selected || !confirm("Delete this conversation permanently?")) return;
    await del({ data: { id: selected.id } });
    setSelected(null);
    refresh();
  }

  if (!isAdmin) return null;

  return (
    <div className="p-6 lg:p-10 max-w-6xl">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Admin
      </Link>
      <h1 className="mt-2 text-3xl font-black tracking-tight flex items-center gap-2">
        <Inbox className="h-7 w-7" /> Inbox {newCount > 0 && <span className="text-sm rounded-full bg-primary/20 text-primary px-2 py-0.5">{newCount} new</span>}
      </h1>
      <p className="text-sm text-muted-foreground mt-1">Messages from the Contact page. Replies are emailed to the sender, and their responses come back here.</p>
      {err && <p className="mt-4 text-sm text-destructive">{err}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter messages"
            className="mb-3 w-full rounded-xl border border-white/10 bg-background px-3 py-2 text-sm">
            <option value="active">Active</option>
            <option value="new">New</option>
            <option value="open">Open</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
            <option value="all">All</option>
          </select>
          {rows === null ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : shown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages.</p>
          ) : (
            <ul className="space-y-2">
              {shown.map((r) => (
                <li key={r.id}>
                  <button onClick={() => open(r.id)}
                    className={`w-full text-left rounded-xl border p-3 hover:bg-white/5 ${selected?.id === r.id ? "border-primary/50 bg-white/5" : "border-white/10"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm ${r.status === "new" ? "font-bold" : "font-medium"}`}>{r.name}</span>
                      <span className={`text-[10px] uppercase rounded-full px-2 py-0.5 ${STATUS_STYLE[r.status] ?? ""}`}>{r.status}</span>
                    </div>
                    <p className="truncate text-sm">{r.subject}</p>
                    <p className="text-xs text-muted-foreground">{r.email} · {new Date(r.updated_at).toLocaleDateString()}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="min-w-0">
          {!selected ? (
            <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">Select a message to read and reply.</div>
          ) : (
            <div className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold break-words">{selected.subject}</h2>
                  <p className="text-sm text-muted-foreground break-all">{selected.name} · <a className="hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a></p>
                </div>
                <div className="flex gap-2">
                  <select value={selected.status} onChange={(e) => changeStatus(e.target.value)} aria-label="Status"
                    className="rounded-lg border border-white/10 bg-background px-2 py-1 text-sm">
                    <option value="new">New</option><option value="open">Open</option>
                    <option value="replied">Replied</option><option value="closed">Closed</option>
                  </select>
                  <Button size="sm" variant="ghost" onClick={remove} aria-label="Delete conversation"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {selected.entries.map((e) => (
                  <div key={e.id} className={`rounded-xl p-4 ${e.author === "admin" ? "border border-primary/30 bg-primary/10 ml-6" : "border border-white/10 bg-white/5 mr-6"}`}>
                    <p className="text-xs text-muted-foreground mb-1">
                      {e.author === "admin" ? "You" : selected.name} · {new Date(e.created_at).toLocaleString()}
                      {e.author === "admin" && e.email_status && e.email_status !== "sent" && <span className="ml-2 text-destructive">email {e.email_status}</span>}
                    </p>
                    <p className="text-sm whitespace-pre-wrap break-words">{e.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-muted-foreground">Reply to {selected.name}</span>
                  <textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} maxLength={10000}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                </label>
                {note && <p className="text-sm text-muted-foreground" role="status">{note}</p>}
                <Button variant="brand" onClick={sendReply} disabled={busy || !body.trim()}>
                  {busy ? "Sending…" : "Send reply"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
