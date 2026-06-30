import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CATEGORIES = ["general", "wins", "workflows", "feedback", "help"] as const;

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: threads, error } = await context.supabase
      .from("community_threads")
      .select("id, user_id, title, category, pinned, created_at, last_activity_at")
      .order("pinned", { ascending: false })
      .order("last_activity_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    const rows = threads ?? [];

    const ids = rows.map((r) => r.id);
    const userIds = Array.from(new Set(rows.map((r) => r.user_id)));

    const [profilesRes, postCountsRes, likeCountsRes] = await Promise.all([
      userIds.length
        ? context.supabase.from("profiles").select("user_id, display_name").in("user_id", userIds)
        : Promise.resolve({ data: [], error: null } as const),
      ids.length
        ? context.supabase.from("community_posts").select("thread_id").in("thread_id", ids)
        : Promise.resolve({ data: [], error: null } as const),
      ids.length
        ? context.supabase.from("community_likes").select("thread_id").in("thread_id", ids)
        : Promise.resolve({ data: [], error: null } as const),
    ]);

    const names: Record<string, string> = Object.fromEntries(
      (profilesRes.data ?? []).map((p) => [p.user_id as string, (p.display_name as string) ?? "Member"]),
    );
    const replyCount: Record<string, number> = {};
    for (const p of postCountsRes.data ?? []) {
      const k = p.thread_id as string;
      replyCount[k] = (replyCount[k] ?? 0) + 1;
    }
    const likeCount: Record<string, number> = {};
    for (const l of likeCountsRes.data ?? []) {
      const k = l.thread_id as string;
      if (k) likeCount[k] = (likeCount[k] ?? 0) + 1;
    }

    return rows.map((r) => ({
      id: r.id as string,
      title: r.title as string,
      category: r.category as string,
      pinned: r.pinned as boolean,
      created_at: r.created_at as string,
      last_activity_at: r.last_activity_at as string,
      author: names[r.user_id as string] ?? "Member",
      author_id: r.user_id as string,
      replies: replyCount[r.id as string] ?? 0,
      likes: likeCount[r.id as string] ?? 0,
    }));
  });

export const getThread = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: thread, error } = await context.supabase
      .from("community_threads")
      .select("id, user_id, title, body, category, pinned, created_at, last_activity_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!thread) throw new Error("Thread not found.");

    const { data: posts } = await context.supabase
      .from("community_posts")
      .select("id, user_id, body, created_at")
      .eq("thread_id", data.id)
      .order("created_at", { ascending: true })
      .limit(500);

    const userIds = Array.from(
      new Set([thread.user_id as string, ...(posts ?? []).map((p) => p.user_id as string)]),
    );
    const { data: profs } = userIds.length
      ? await context.supabase.from("profiles").select("user_id, display_name").in("user_id", userIds)
      : { data: [] as Array<{ user_id: string; display_name: string | null }> };
    const names: Record<string, string> = Object.fromEntries(
      (profs ?? []).map((p) => [p.user_id as string, (p.display_name as string) ?? "Member"]),
    );

    const [threadLikes, postLikes, myThreadLike, myPostLikes] = await Promise.all([
      context.supabase
        .from("community_likes")
        .select("id", { count: "exact", head: true })
        .eq("thread_id", data.id),
      (posts ?? []).length
        ? context.supabase
            .from("community_likes")
            .select("post_id")
            .in("post_id", (posts ?? []).map((p) => p.id as string))
        : Promise.resolve({ data: [], error: null } as const),
      context.supabase
        .from("community_likes")
        .select("id")
        .eq("thread_id", data.id)
        .eq("user_id", context.userId)
        .maybeSingle(),
      (posts ?? []).length
        ? context.supabase
            .from("community_likes")
            .select("post_id")
            .eq("user_id", context.userId)
            .in("post_id", (posts ?? []).map((p) => p.id as string))
        : Promise.resolve({ data: [], error: null } as const),
    ]);

    const postLikeMap: Record<string, number> = {};
    for (const row of postLikes.data ?? []) {
      const k = row.post_id as string;
      postLikeMap[k] = (postLikeMap[k] ?? 0) + 1;
    }
    const myLikedPosts = new Set((myPostLikes.data ?? []).map((r) => r.post_id as string));

    return {
      id: thread.id as string,
      title: thread.title as string,
      body: thread.body as string,
      category: thread.category as string,
      pinned: thread.pinned as boolean,
      created_at: thread.created_at as string,
      author: names[thread.user_id as string] ?? "Member",
      author_id: thread.user_id as string,
      likes: threadLikes.count ?? 0,
      liked_by_me: !!myThreadLike.data,
      posts: (posts ?? []).map((p) => ({
        id: p.id as string,
        body: p.body as string,
        created_at: p.created_at as string,
        author: names[p.user_id as string] ?? "Member",
        author_id: p.user_id as string,
        likes: postLikeMap[p.id as string] ?? 0,
        liked_by_me: myLikedPosts.has(p.id as string),
      })),
    };
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        title: z.string().min(3).max(200),
        body: z.string().min(1).max(8000),
        category: z.enum(CATEGORIES).default("general"),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("community_threads")
      .insert({
        user_id: context.userId,
        title: data.title.trim(),
        body: data.body.trim(),
        category: data.category,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const createReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ threadId: z.string().uuid(), body: z.string().min(1).max(8000) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("community_posts").insert({
      thread_id: data.threadId,
      user_id: context.userId,
      body: data.body.trim(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("community_threads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("community_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleThreadLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ threadId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: existing } = await context.supabase
      .from("community_likes")
      .select("id")
      .eq("thread_id", data.threadId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (existing) {
      const { error } = await context.supabase.from("community_likes").delete().eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { liked: false };
    }
    const { error } = await context.supabase
      .from("community_likes")
      .insert({ thread_id: data.threadId, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { liked: true };
  });

export const togglePostLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ postId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: existing } = await context.supabase
      .from("community_likes")
      .select("id")
      .eq("post_id", data.postId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (existing) {
      const { error } = await context.supabase.from("community_likes").delete().eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { liked: false };
    }
    const { error } = await context.supabase
      .from("community_likes")
      .insert({ post_id: data.postId, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { liked: true };
  });
