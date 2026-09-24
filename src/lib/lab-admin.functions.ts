import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !data) throw new Error("Forbidden");
}

const csv = z.array(z.string().trim().min(1).max(60)).max(20).default([]);

const postSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, dashes"),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().max(500).default(""),
  content: z.string().min(1).max(120000),
  pain_point: z.string().max(500).default(""),
  problem_solved: z.string().max(1000).default(""),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  time_to_implement: z.string().max(60).default(""),
  audience: csv,
  tools_used: csv,
  tags: csv,
  cover_image_url: z.string().url().max(500).or(z.literal("")).default(""),
  seo_title: z.string().max(70).default(""),
  seo_description: z.string().max(200).default(""),
  publish: z.boolean().default(false),
});

export type LabPostInput = z.infer<typeof postSchema>;

export const listLabPostsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await (context.supabase as any)
      .from("newsletter_posts")
      .select("id, slug, title, published_at, updated_at")
      .eq("post_type", "lab")
      .order("updated_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return { posts: data ?? [] };
  });

export const getLabPostAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await (context.supabase as any)
      .from("newsletter_posts")
      .select("*")
      .eq("id", data.id)
      .eq("post_type", "lab")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Not found");
    return { post: row };
  });

export const saveLabPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => postSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = context.supabase as any;

    const { data: clash } = await sb
      .from("newsletter_posts")
      .select("id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (clash && clash.id !== data.id) throw new Error("That slug is already used by another post.");

    let publishedAt: string | null = null;
    if (data.publish) {
      if (data.id) {
        const { data: cur } = await sb.from("newsletter_posts").select("published_at").eq("id", data.id).maybeSingle();
        publishedAt = cur?.published_at ?? new Date().toISOString();
      } else publishedAt = new Date().toISOString();
    }

    const words = data.content.trim().split(/\s+/).filter(Boolean).length;
    const row = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt || null,
      content: data.content,
      post_type: "lab",
      pain_point: data.pain_point || null,
      problem_solved: data.problem_solved || null,
      difficulty: data.difficulty,
      time_to_implement: data.time_to_implement || null,
      audience: data.audience,
      tools_used: data.tools_used,
      tags: data.tags.map((t) => t.toLowerCase()),
      cover_image_url: data.cover_image_url || null,
      seo_title: data.seo_title || data.title.slice(0, 70),
      seo_description: data.seo_description || data.excerpt.slice(0, 200) || null,
      reading_minutes: Math.max(1, Math.round(words / 220)),
      published_at: publishedAt,
    };

    const q = data.id
      ? sb.from("newsletter_posts").update(row).eq("id", data.id).eq("post_type", "lab")
      : sb.from("newsletter_posts").insert({ ...row, author_id: context.userId });
    const { data: saved, error } = await q.select("id, slug, published_at").single();
    if (error) throw new Error(error.message);
    return { post: saved };
  });

export const deleteLabPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await (context.supabase as any)
      .from("newsletter_posts")
      .delete()
      .eq("id", data.id)
      .eq("post_type", "lab");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
