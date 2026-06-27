import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function serverPublic() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const getEngagement = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ postId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = serverPublic();
    const [likes, comments] = await Promise.all([
      sb.from("newsletter_post_likes").select("id", { count: "exact", head: true }).eq("post_id", data.postId),
      sb.from("newsletter_post_comments").select("id, body, user_id, created_at").eq("post_id", data.postId).order("created_at", { ascending: false }).limit(200),
    ]);
    if (likes.error) throw new Error(likes.error.message);
    if (comments.error) throw new Error(comments.error.message);

    const userIds = Array.from(new Set((comments.data ?? []).map((c) => c.user_id)));
    let names: Record<string, string> = {};
    if (userIds.length) {
      const { data: profs } = await sb.from("profiles").select("user_id, display_name").in("user_id", userIds);
      names = Object.fromEntries((profs ?? []).map((p: any) => [p.user_id, p.display_name ?? "Reader"]));
    }

    return {
      likeCount: likes.count ?? 0,
      comments: (comments.data ?? []).map((c) => ({
        id: c.id,
        body: c.body,
        created_at: c.created_at,
        author: names[c.user_id] ?? "Reader",
      })),
    };
  });

export const getMyLike = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ postId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: row } = await context.supabase
      .from("newsletter_post_likes")
      .select("id")
      .eq("post_id", data.postId)
      .eq("user_id", context.userId)
      .maybeSingle();
    return { liked: !!row };
  });

export const toggleLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ postId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: existing } = await context.supabase
      .from("newsletter_post_likes")
      .select("id")
      .eq("post_id", data.postId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (existing) {
      const { error } = await context.supabase.from("newsletter_post_likes").delete().eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { liked: false };
    } else {
      const { error } = await context.supabase
        .from("newsletter_post_likes")
        .insert({ post_id: data.postId, user_id: context.userId });
      if (error) throw new Error(error.message);
      return { liked: true };
    }
  });

export const addComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ postId: z.string().uuid(), body: z.string().min(1).max(4000) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("newsletter_post_comments")
      .insert({ post_id: data.postId, user_id: context.userId, body: data.body.trim() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("newsletter_post_comments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
