import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { getContactThread, replyToContactThread } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact_/r/$token")({
  head: () => ({
    meta: [
      { title: "Your conversation — AI Income Systems Lab" },
      { name: "description", content: "View and reply to your conversation with AI Income Systems Lab." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Your conversation — AI Income Systems Lab" },
      { property: "og:description", content: "View and reply to your conversation with AI Income Systems Lab." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ThreadPage,
});

type Thread = Awaited<ReturnType<typeof getContactThread>>;

function ThreadPage() {
  const { token } = Route.useParams();
  const load = useServerFn(getContactThread);
  const reply = useServerFn(replyToContactThread);
  const [thread, setThread] = useState<Thread | undefined>(undefined);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = () => load({ data: { token } }).then(setThread).catch(() => setThread(null));
  useEffect(() => { refresh(); }, [token]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    setMsg(null);
    try {
      await reply({ data: { token, body } });
      setBody("");
      setMsg("Reply sent — we'll get back to you by email.");
      await refresh();
    } catch (e: any) {
      setMsg(e?.message ?? "Could not send reply.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        {thread === undefined ? (
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        ) : thread === null ? (
          <p className="text-center text-muted-foreground">This conversation link is invalid or has been removed.</p>
        ) : (
          <>
            <h1 className="text-2xl font-black tracking-tight">{thread.subject}</h1>
            <div className="mt-6 space-y-3">
              {thread.entries.map((e) => (
                <div key={e.id} className={`rounded-2xl p-4 ${e.author === "admin" ? "border border-primary/30 bg-primary/10" : "glass"}`}>
                  <p className="text-xs text-muted-foreground mb-1">
                    {e.author === "admin" ? "AI Income Systems Lab" : "You"} · {new Date(e.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm whitespace-pre-wrap break-words">{e.body}</p>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="mt-6 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-muted-foreground">Your reply</span>
                <textarea rows={5} maxLength={5000} value={body} onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
              </label>
              {msg && <p className="text-sm text-muted-foreground" role="status">{msg}</p>}
              <Button type="submit" variant="brand" disabled={sending || !body.trim()}>
                {sending ? "Sending…" : "Send reply"}
              </Button>
            </form>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
