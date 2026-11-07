import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { winCommentSchema, winLikeSchema } from "./win-engagement-input";

export const getWinEngagement = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ winId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const [likes, comments] = await Promise.all([
      context.supabase.from("win_likes").select("user_id").eq("win_id", data.winId),
      context.supabase.from("win_comments").select("id, user_id, author_name, body, created_at").eq("win_id", data.winId).order("created_at"),
    ]);
    if (likes.error) throw new Error(likes.error.message);
    if (comments.error) throw new Error(comments.error.message);
    return { likeCount: likes.data.length, liked: likes.data.some((l) => l.user_id === context.userId), comments: comments.data };
  });

export const setWinLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => winLikeSchema.parse(d))
  .handler(async ({ context, data }) => {
    if (data.liked) {
      const { error } = await context.supabase.from("win_likes").insert({ win_id: data.winId, user_id: context.userId });
      if (error && error.code !== "23505") throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("win_likes").delete().eq("win_id", data.winId).eq("user_id", context.userId);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const addWinComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => winCommentSchema.parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("win_comments").insert({ win_id: data.winId, user_id: context.userId, body: data.body });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteWinComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("win_comments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getWinNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("win_notifications")
      .select("id, actor_name, win_id, kind, created_at, read_at, wins(system)")
      .eq("recipient_id", context.userId).order("created_at", { ascending: false }).limit(50);
    if (error) throw new Error(error.message);
    return data;
  });

export const markWinNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ ids: z.array(z.string().uuid()).min(1).max(50) }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("win_notifications").update({ read_at: new Date().toISOString() })
      .eq("recipient_id", context.userId).in("id", data.ids).is("read_at", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });