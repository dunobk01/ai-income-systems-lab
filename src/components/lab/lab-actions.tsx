import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Heart, Bookmark, Share2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/lib/auth-context";
import { toggleLike } from "@/lib/newsletter-engagement.functions";
import { toggleSave, incrementShare } from "@/lib/lab.functions";

const SITE = "https://ai-income-systems.com";

function sharedOnce(postId: string) {
  try {
    const key = "lab-shared";
    const set = new Set<string>(JSON.parse(sessionStorage.getItem(key) ?? "[]"));
    if (set.has(postId)) return true;
    set.add(postId);
    sessionStorage.setItem(key, JSON.stringify([...set]));
    return false;
  } catch {
    return false;
  }
}

function AuthPrompt({ children, message }: { children: React.ReactNode; message: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-56 text-sm" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <Link
          to="/login"
          search={{ redirect: "/thelab" }}
          className="mt-2 inline-block text-[color:var(--brand)] underline"
        >
          Sign in
        </Link>
      </PopoverContent>
    </Popover>
  );
}

const btn =
  "inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]";

export function LabActions({
  post,
  liked,
  saved,
  vertical = false,
  onComment,
  invalidateKey = ["lab", "posts"],
}: {
  post: { id: string; slug: string; like_count: number; comment_count: number; save_count: number };
  liked: boolean;
  saved: boolean;
  vertical?: boolean;
  onComment?: () => void;
  invalidateKey?: unknown[];
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const likeFn = useServerFn(toggleLike);
  const saveFn = useServerFn(toggleSave);
  const shareFn = useServerFn(incrementShare);

  const [likeState, setLikeState] = useState({ on: liked, count: post.like_count });
  const [saveState, setSaveState] = useState({ on: saved, count: post.save_count });
  const [pop, setPop] = useState<"like" | "save" | null>(null);

  const likeM = useMutation({
    mutationFn: () => likeFn({ data: { postId: post.id } }),
    onMutate: () => {
      const prev = likeState;
      setLikeState({ on: !prev.on, count: prev.count + (prev.on ? -1 : 1) });
      setPop("like");
      setTimeout(() => setPop(null), 240);
      return prev;
    },
    onError: (_e, _v, prev) => {
      if (prev) setLikeState(prev);
      toast.error("Couldn't update that. Try again.");
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: invalidateKey }),
  });

  const saveM = useMutation({
    mutationFn: () => saveFn({ data: { postId: post.id } }),
    onMutate: () => {
      const prev = saveState;
      setSaveState({ on: !prev.on, count: prev.count + (prev.on ? -1 : 1) });
      setPop("save");
      setTimeout(() => setPop(null), 240);
      return prev;
    },
    onError: (_e, _v, prev) => {
      if (prev) setSaveState(prev);
      toast.error("Couldn't update that. Try again.");
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: invalidateKey });
      void qc.invalidateQueries({ queryKey: ["lab", "saves"] });
    },
  });

  const share = async () => {
    const url = `${SITE}/thelab/${post.slug}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ url, title: "The Lab" });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* user cancelled or clipboard blocked */
    }
    if (!sharedOnce(post.id)) {
      try {
        await shareFn({ data: { postId: post.id } });
      } catch {
        /* non-fatal */
      }
    }
  };

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const popStyle = (active: boolean) =>
    active ? { transform: "scale(1.22)", transition: "transform 200ms ease" } : { transition: "transform 200ms ease" };

  const likeBtn = (
    <button
      type="button"
      aria-pressed={likeState.on}
      aria-label={likeState.on ? "Unlike this build" : "Like this build"}
      className={btn}
      onClick={(e) => {
        stop(e);
        if (user) likeM.mutate();
      }}
    >
      <Heart
        className={`h-4 w-4 ${likeState.on ? "fill-[color:var(--brand)] text-[color:var(--brand)]" : ""}`}
        style={popStyle(pop === "like")}
      />
      {likeState.count}
    </button>
  );

  const saveBtn = (
    <button
      type="button"
      aria-pressed={saveState.on}
      aria-label={saveState.on ? "Remove from saved" : "Save this build"}
      className={btn}
      onClick={(e) => {
        stop(e);
        if (user) saveM.mutate();
      }}
    >
      <Bookmark
        className={`h-4 w-4 ${saveState.on ? "fill-[color:var(--brand)] text-[color:var(--brand)]" : ""}`}
        style={popStyle(pop === "save")}
      />
      {saveState.count}
    </button>
  );

  const commentBtn = (
    <button
      type="button"
      aria-label="Comments"
      className={btn}
      onClick={(e) => {
        stop(e);
        if (user) onComment?.();
      }}
    >
      <MessageCircle className="h-4 w-4" />
      {post.comment_count}
    </button>
  );

  return (
    <div
      className={vertical ? "flex flex-col items-center gap-2" : "flex items-center gap-1"}
      onClick={(e) => e.stopPropagation()}
    >
      {user ? likeBtn : <AuthPrompt message="Sign in to like this build">{likeBtn}</AuthPrompt>}
      {user ? saveBtn : <AuthPrompt message="Sign in to save this build">{saveBtn}</AuthPrompt>}
      <button
        type="button"
        aria-label="Share this build"
        className={btn}
        onClick={(e) => {
          stop(e);
          void share();
        }}
      >
        <Share2 className="h-4 w-4" />
        <span className="sr-only">Share</span>
      </button>
      {user ? commentBtn : <AuthPrompt message="Sign in to comment on this build">{commentBtn}</AuthPrompt>}
    </div>
  );
}
