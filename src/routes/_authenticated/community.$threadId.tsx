import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Heart, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  getThread,
  createReply,
  toggleThreadLike,
  togglePostLike,
  deleteThread,
  deleteReply,
} from "@/lib/community.functions";

export const Route = createFileRoute("/_authenticated/community/$threadId")({
  head: () => ({ meta: [{ title: "Thread — Community" }, { name: "robots", content: "noindex" }] }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(getThread);
  const replyFn = useServerFn(createReply);
  const likeThreadFn = useServerFn(toggleThreadLike);
  const likePostFn = useServerFn(togglePostLike);
  const delThreadFn = useServerFn(deleteThread);
  const delReplyFn = useServerFn(deleteReply);

  const q = useQuery({
    queryKey: ["community-thread", threadId],
    queryFn: () => getFn({ data: { id: threadId } }),
  });

  const [reply, setReply] = useState("");
  const replyM = useMutation({
    mutationFn: () => replyFn({ data: { threadId, body: reply } }),
    onSuccess: () => { setReply(""); void qc.invalidateQueries({ queryKey: ["community-thread", threadId] }); void qc.invalidateQueries({ queryKey: ["community-threads"] }); },
  });

  const likeThreadM = useMutation({
    mutationFn: () => likeThreadFn({ data: { threadId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-thread", threadId] }),
  });
  const likePostM = useMutation({
    mutationFn: (postId: string) => likePostFn({ data: { postId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-thread", threadId] }),
  });
  const delThreadM = useMutation({
    mutationFn: () => delThreadFn({ data: { id: threadId } }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["community-threads"] }); nav({ to: "/community" }); },
  });
  const delReplyM = useMutation({
    mutationFn: (id: string) => delReplyFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-thread", threadId] }),
  });

  if (q.isLoading) return <div className="p-10 text-center"><Loader2 className="h-5 w-5 mx-auto animate-spin" /></div>;
  if (q.isError || !q.data) return <div className="p-10 text-center text-red-400">{(q.error as Error)?.message ?? "Thread not found"}</div>;

  const t = q.data;
  const canDelete = (authorId: string) => isAdmin || user?.id === authorId;

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <Link to="/community" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All threads
      </Link>

      <article className="glass-strong rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{t.category}</Badge>
          <span className="text-xs text-muted-foreground">by {t.author} · {new Date(t.created_at).toLocaleDateString()}</span>
          {canDelete(t.author_id) && (
            <button
              className="ml-auto text-xs text-muted-foreground hover:text-red-400 inline-flex items-center gap-1"
              onClick={() => { if (confirm("Delete this thread?")) delThreadM.mutate(); }}
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          )}
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold leading-tight">{t.title}</h1>
        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{t.body}</div>
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => likeThreadM.mutate()}
            className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition ${
              t.liked_by_me ? "border-[color:var(--brand)] bg-[color:var(--brand)]/15 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className={`h-4 w-4 ${t.liked_by_me ? "fill-current" : ""}`} /> {t.likes}
          </button>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" /> {t.posts.length} {t.posts.length === 1 ? "reply" : "replies"}
          </span>
        </div>
      </article>

      <section className="mt-8 grid gap-3">
        {t.posts.map((p) => (
          <div key={p.id} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">{p.author}</span>
              <span>· {new Date(p.created_at).toLocaleString()}</span>
              {canDelete(p.author_id) && (
                <button
                  className="ml-auto hover:text-red-400 inline-flex items-center gap-1"
                  onClick={() => { if (confirm("Delete this reply?")) delReplyM.mutate(p.id); }}
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              )}
            </div>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{p.body}</div>
            <button
              onClick={() => likePostM.mutate(p.id)}
              className={`mt-3 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition ${
                p.liked_by_me ? "border-[color:var(--brand)] bg-[color:var(--brand)]/15 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${p.liked_by_me ? "fill-current" : ""}`} /> {p.likes}
            </button>
          </div>
        ))}
      </section>

      <div className="mt-8 glass-strong rounded-2xl p-5">
        <h3 className="font-semibold mb-3">Reply</h3>
        <Textarea
          placeholder="Add to the conversation — share an experience, ask a sharper question, or drop a workflow snippet."
          rows={5}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <div className="mt-3 flex justify-end">
          <Button
            variant="brand"
            disabled={replyM.isPending || reply.trim().length < 1}
            onClick={() => replyM.mutate()}
          >
            {replyM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post reply"}
          </Button>
        </div>
        {replyM.isError && (
          <p className="mt-2 text-sm text-red-400">{(replyM.error as Error)?.message}</p>
        )}
      </div>
    </div>
  );
}
