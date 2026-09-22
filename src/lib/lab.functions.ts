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

const LAB_FIELDS =
  "id, slug, title, excerpt, cover_image_url, published_at, tags, pain_point, audience, problem_solved, difficulty, time_to_implement, tools_used, reading_minutes, share_count";

export type LabPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  tags: string[];
  pain_point: string | null;
  audience: string[];
  problem_solved: string | null;
  difficulty: string | null;
  time_to_implement: string | null;
  tools_used: string[];
  reading_minutes: number | null;
  share_count: number;
  like_count: number;
  comment_count: number;
  save_count: number;
};

async function decorateCounts(sb: any, rows: any[]): Promise<LabPost[]> {
  const ids = rows.map((r) => r.id);
  if (!ids.length) return [];
  const [likes, comments, saves] = await Promise.all([
    sb.from("newsletter_post_likes").select("post_id").in("post_id", ids),
    sb.from("newsletter_post_comments").select("post_id").in("post_id", ids),
    sb.rpc("lab_save_counts"),
  ]);
  const tally = (data: any[] | null) => {
    const m = new Map<string, number>();
    for (const r of data ?? []) m.set(r.post_id, (m.get(r.post_id) ?? 0) + 1);
    return m;
  };
  const likeMap = tally(likes.data);
  const commentMap = tally(comments.data);
  const saveMap = new Map<string, number>(
    (saves.data ?? []).map((r: any) => [r.post_id as string, Number(r.save_count)]),
  );
  return rows.map((r) => ({
    ...r,
    audience: r.audience ?? [],
    tools_used: r.tools_used ?? [],
    tags: r.tags ?? [],
    share_count: r.share_count ?? 0,
    like_count: likeMap.get(r.id) ?? 0,
    comment_count: commentMap.get(r.id) ?? 0,
    save_count: saveMap.get(r.id) ?? 0,
  })) as LabPost[];
}

export const listLabPosts = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        audience: z.string().max(60).optional().nullable(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional().nullable(),
        tag: z.string().max(60).optional().nullable(),
        search: z.string().max(120).optional().nullable(),
        limit: z.number().int().min(1).max(100).optional(),
      })
      .optional()
      .default({})
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const sb = serverPublic();
    let q = (sb as any)
      .from("newsletter_posts")
      .select(LAB_FIELDS)
      .eq("post_type", "lab")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(data.limit ?? 60);

    if (data.audience) q = q.contains("audience", [data.audience]);
    if (data.difficulty) q = q.eq("difficulty", data.difficulty);
    if (data.tag) q = q.contains("tags", [data.tag]);
    if (data.search) {
      const s = data.search.replace(/[%,()]/g, " ").trim();
      if (s) q = q.or(`title.ilike.%${s}%,excerpt.ilike.%${s}%`);
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { posts: await decorateCounts(sb, rows ?? []) };
  });

export const getLabPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = serverPublic();
    const { data: post, error } = await (sb as any)
      .from("newsletter_posts")
      .select(`${LAB_FIELDS}, content, seo_title, seo_description, post_type`)
      .eq("slug", data.slug)
      .eq("post_type", "lab")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!post) return { post: null, related: [] as LabPost[] };

    const [full] = await decorateCounts(sb, [post]);

    // Related: shared audience or tags, newest first, max 3
    const { data: others } = await (sb as any)
      .from("newsletter_posts")
      .select(LAB_FIELDS)
      .eq("post_type", "lab")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .neq("id", post.id)
      .order("published_at", { ascending: false })
      .limit(24);
    const aud = new Set<string>(post.audience ?? []);
    const tags = new Set<string>(post.tags ?? []);
    const scored = (others ?? [])
      .map((o: any) => ({
        o,
        score:
          (o.audience ?? []).filter((a: string) => aud.has(a)).length +
          (o.tags ?? []).filter((t: string) => tags.has(t)).length,
      }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 3)
      .map((x: any) => x.o);

    return { post: { ...full, content: post.content, seo_title: post.seo_title, seo_description: post.seo_description }, related: await decorateCounts(sb, scored) };
  });

export const toggleSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ postId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: existing } = await (context.supabase as any)
      .from("newsletter_post_saves")
      .select("id")
      .eq("post_id", data.postId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (existing) {
      const { error } = await (context.supabase as any)
        .from("newsletter_post_saves")
        .delete()
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { saved: false };
    }
    const { error } = await (context.supabase as any)
      .from("newsletter_post_saves")
      .insert({ post_id: data.postId, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { saved: true };
  });

export const listMySaves = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: saves, error } = await (context.supabase as any)
      .from("newsletter_post_saves")
      .select("post_id")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    const ids = (saves ?? []).map((s: any) => s.post_id);
    if (!ids.length) return { posts: [] as LabPost[], savedIds: [] as string[] };
    const sb = serverPublic();
    const { data: rows } = await (sb as any)
      .from("newsletter_posts")
      .select(LAB_FIELDS)
      .in("id", ids)
      .eq("post_type", "lab")
      .order("published_at", { ascending: false });
    return { posts: await decorateCounts(sb, rows ?? []), savedIds: ids as string[] };
  });

export const listMySavedIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await (context.supabase as any)
      .from("newsletter_post_saves")
      .select("post_id")
      .eq("user_id", context.userId);
    return { ids: ((data ?? []) as any[]).map((r) => r.post_id as string) };
  });

export const incrementShare = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ postId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = serverPublic();
    const { data: count, error } = await (sb as any).rpc("increment_lab_share", {
      _post_id: data.postId,
    });
    if (error) throw new Error(error.message);
    return { shareCount: (count as number) ?? 0 };
  });
