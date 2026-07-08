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

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !data) throw new Error("Forbidden");
}

/* ---------------- Public: blog / tags ---------------- */

export const listAllBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = serverPublic();
  const { data, error } = await (sb
    .from("newsletter_posts") as any)
    .select("id, slug, title, excerpt, cover_image_url, published_at, tags, pillar_slug")
    .eq("post_type", "blog")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  const posts = (data ?? []) as Array<{ tags?: string[] | null }>;
  const tagSet = new Set<string>();
  for (const p of posts) for (const t of (p.tags ?? [])) tagSet.add(t);
  return { posts: data ?? [], tags: Array.from(tagSet).sort() };
});

export const listPostsByTag = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ tag: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const sb = serverPublic();
    const { data: posts, error } = await (sb
      .from("newsletter_posts") as any)
      .select("id, slug, title, excerpt, cover_image_url, published_at, tags, pillar_slug")
      .eq("post_type", "blog")
      .contains("tags", [data.tag])
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return { tag: data.tag, posts: posts ?? [] };
  });

/* ---------------- Public: pillars ---------------- */

export const listPublishedPillars = createServerFn({ method: "GET" }).handler(async () => {
  const sb = serverPublic();
  const { data, error } = await sb
    .from("blog_pillars")
    .select("id, slug, title, description, cover_image_url, published_at")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { pillars: data ?? [] };
});

export const getPillarBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = serverPublic();
    const { data: pillar, error } = await sb
      .from("blog_pillars")
      .select("id, slug, title, description, intro, cover_image_url, published_at")
      .eq("slug", data.slug)
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!pillar) return { pillar: null, posts: [] };
    const { data: posts, error: pErr } = await sb
      .from("newsletter_posts")
      .select("id, slug, title, excerpt, cover_image_url, published_at, tags")
      .eq("pillar_slug", data.slug)
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });
    if (pErr) throw new Error(pErr.message);
    return { pillar, posts: posts ?? [] };
  });

/* ---------------- Admin: pillars ---------------- */

export const listAllPillarsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("blog_pillars")
      .select("id, slug, title, description, published_at, updated_at, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { pillars: data ?? [] };
  });

const pillarSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "lowercase, numbers, dashes"),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional().nullable(),
  intro: z.string().max(20000).optional().nullable(),
  cover_image_url: z.string().url().max(500).optional().nullable(),
  publish: z.boolean().default(false),
});

export const upsertPillar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pillarSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const row: any = {
      slug: data.slug,
      title: data.title,
      description: data.description ?? null,
      intro: data.intro ?? null,
      cover_image_url: data.cover_image_url ?? null,
    };
    if (data.publish) row.published_at = new Date().toISOString();
    if (data.id) {
      const { data: r, error } = await context.supabase
        .from("blog_pillars").update(row).eq("id", data.id).select("id").single();
      if (error) throw new Error(error.message);
      return { id: r.id };
    }
    if (!data.publish) row.published_at = null;
    const { data: r, error } = await context.supabase
      .from("blog_pillars").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    return { id: r.id };
  });

export const deletePillar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("blog_pillars").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const togglePillarPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), publish: z.boolean() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("blog_pillars")
      .update({ published_at: data.publish ? new Date().toISOString() : null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
