import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, CheckCheck, Heart, Loader2, MessageCircle, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { addWinComment, deleteWinComment, getWinEngagement, getWinNotifications, markWinNotificationsRead, setWinLike } from "@/lib/win-engagement.functions";

export function WinEngagement({ winId }: { winId: string }) {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const readFn = useServerFn(getWinEngagement);
  const likeFn = useServerFn(setWinLike);
  const commentFn = useServerFn(addWinComment);
  const deleteFn = useServerFn(deleteWinComment);
  const [expanded, setExpanded] = useState(false);
  const [body, setBody] = useState("");
  const key = ["win-engagement", winId];
  const data = useQuery({ queryKey: key, queryFn: () => readFn({ data: { winId } }), refetchInterval: 30000 });
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: key });
    void qc.invalidateQueries({ queryKey: ["win-notifications"] });
  };
  const like = useMutation({ mutationFn: () => likeFn({ data: { winId, liked: !data.data?.liked } }), onSuccess: refresh });
  const comment = useMutation({ mutationFn: () => commentFn({ data: { winId, body } }), onSuccess: () => { setBody(""); refresh(); } });
  const remove = useMutation({ mutationFn: (id: string) => deleteFn({ data: { id } }), onSuccess: refresh });
  const error = data.error || like.error || comment.error || remove.error;
  return (
    <div className="mt-4 border-t border-border pt-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant={data.data?.liked ? "brand" : "ghost"} size="sm" disabled={data.isPending || data.isError || like.isPending} aria-pressed={data.data?.liked ?? false} aria-label={data.data?.liked ? "Unlike win" : "Like win"} onClick={() => like.mutate()}>
          {like.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${data.data?.liked ? "fill-current" : ""}`} />} {data.data?.likeCount ?? 0}
        </Button>
        <Button variant="ghost" size="sm" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          <MessageCircle className="h-4 w-4" /> {data.data?.comments.length ?? 0} comments
        </Button>
      </div>
      {expanded && (
        <div className="mt-3 space-y-4">
          {data.data?.comments.map((c) => (
            <div key={c.id} className="flex gap-2 items-start">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{c.author_name} · {new Date(c.created_at).toLocaleDateString()}</p>
                <p className="mt-1 text-sm break-words whitespace-pre-wrap">{c.body}</p>
              </div>
              {(c.user_id === user?.id || isAdmin) && <Button variant="ghost" size="icon" aria-label="Delete comment" title="Delete comment" disabled={remove.isPending} onClick={() => { if (confirm("Delete this comment?")) remove.mutate(c.id); }}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          ))}
          <form onSubmit={(e) => { e.preventDefault(); if (body.trim() && !comment.isPending) comment.mutate(); }} className="grid gap-2">
            <label htmlFor={`comment-${winId}`} className="text-sm font-medium">Add a comment</label>
            <Textarea id={`comment-${winId}`} value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} rows={2} placeholder="Celebrate their progress…" />
            <Button type="submit" variant="brand" size="sm" className="justify-self-end" disabled={!body.trim() || comment.isPending}>{comment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Post comment</Button>
          </form>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error.message}</p>}
    </div>
  );
}

export function WinNotifications() {
  const qc = useQueryClient();
  const getFn = useServerFn(getWinNotifications);
  const markFn = useServerFn(markWinNotificationsRead);
  const [open, setOpen] = useState(false);
  const notifications = useQuery({ queryKey: ["win-notifications"], queryFn: () => getFn(), refetchInterval: 30000 });
  const unread = notifications.data?.filter((n) => !n.read_at) ?? [];
  const mark = useMutation({ mutationFn: () => markFn({ data: { ids: unread.map((n) => n.id) } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["win-notifications"] }) });
  return (
    <section className="mb-6" aria-label="Win notifications">
      <Button variant="glass" onClick={() => setOpen(!open)} aria-expanded={open}><Bell className="h-4 w-4" /> Activity {unread.length > 0 && `(${unread.length} new)`}</Button>
      {open && <div className="mt-3 border-y border-border py-4 space-y-3">
        <div className="flex justify-between items-center gap-2"><h2 className="font-semibold">Your win activity</h2>{unread.length > 0 && <Button variant="ghost" size="sm" disabled={mark.isPending} onClick={() => mark.mutate()}><CheckCheck className="h-4 w-4" /> Mark read</Button>}</div>
        {notifications.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {notifications.data?.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
        {notifications.data?.map((n) => <a key={n.id} href={`#win-${n.win_id}`} onClick={() => document.getElementById(`win-${n.win_id}`)?.scrollIntoView({ block: "center" })} className={`block text-sm break-words ${n.read_at ? "text-muted-foreground" : "text-foreground font-medium"}`}>{n.actor_name} {n.kind === "like" ? "liked" : "commented on"} your win: {n.wins?.system ?? "AI accomplishment"}<span className="block text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</span></a>)}
        {(notifications.error || mark.error) && <p role="alert" className="text-sm text-destructive">{(notifications.error || mark.error)?.message}</p>}
      </div>}
    </section>
  );
}