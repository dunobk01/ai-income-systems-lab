import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import {
  getEngagement,
  getMyLike,
  toggleLike,
  addComment,
  deleteComment,
} from "@/lib/newsletter-engagement.functions";

export function NewsletterEngagement({ postId }: { postId: string }) {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const engFn = useServerFn(getEngagement);
  const myLikeFn = useServerFn(getMyLike);
  const toggleFn = useServerFn(toggleLike);
  const addFn = useServerFn(addComment);
  const delFn = useServerFn(deleteComment);

  const eng = useQuery({
    queryKey: ["nl-eng", postId],
    queryFn: () => engFn({ data: { postId } }),
  });
  const mine = useQuery({
    queryKey: ["nl-mylike", postId, user?.id ?? "anon"],
    queryFn: () => myLikeFn({ data: { postId } }),
    enabled: !!user,
  });

  const like = useMutation({
    mutationFn: () => toggleFn({ data: { postId } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["nl-eng", postId] });
      void qc.invalidateQueries({ queryKey: ["nl-mylike", postId] });
    },
  });

  const [body, setBody] = useState("");
  const post = useMutation({
    mutationFn: () => addFn({ data: { postId, body } }),
    onSuccess: () => {
      setBody("");
      void qc.invalidateQueries({ queryKey: ["nl-eng", postId] });
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["nl-eng", postId] }),
  });

  const liked = mine.data?.liked ?? false;
  const count = eng.data?.likeCount ?? 0;
  const comments = eng.data?.comments ?? [];

  return (
    <div className="mt-12 border-t border-white/10 pt-8">
      <div className="flex items-center gap-3">
        {user ? (
          <Button
            variant={liked ? "brand" : "outline"}
            onClick={() => like.mutate()}
            disabled={like.isPending}
            className="gap-2"
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            {liked ? "Liked" : "Like"}
            <span className="ml-1 opacity-80">· {count}</span>
          </Button>
        ) : (
          <Link to="/login" className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm hover:border-white/30">
            <Heart className="h-4 w-4" /> Like · {count}
          </Link>
        )}
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <MessageCircle className="h-4 w-4" /> {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold">Comments</h3>
        {user ? (
          <div className="mt-3 space-y-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share a thought, a question, or what you''re building…"
              rows={3}
              maxLength={4000}
            />
            <div className="flex justify-end">
              <Button
                variant="brand"
                onClick={() => post.mutate()}
                disabled={post.isPending || body.trim().length === 0}
              >
                {post.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Post comment
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            <Link to="/login" className="text-[color:var(--brand)] underline">Sign in</Link> to leave a comment.
          </p>
        )}

        <ul className="mt-6 space-y-4">
          {comments.length === 0 && (
            <li className="text-sm text-muted-foreground">Be the first to comment.</li>
          )}
          {comments.map((c) => (
            <li key={c.id} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">{c.author}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className="mt-2 text-sm whitespace-pre-wrap text-foreground/90">{c.body}</p>
              {isAdmin && (
                <button
                  onClick={() => del.mutate(c.id)}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-red-300/80 hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
