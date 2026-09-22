import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { timingSafeEqual } from "crypto";

const SITE = "https://ai-income-systems.com";

function authorized(request: Request) {
  const token = process.env["LAB_PUBLISH_TOKEN"];
  if (!token) return false;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

const bodySchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).default(""),
  content: z.string().min(1).max(120000),
  pain_point: z.string().max(500).default(""),
  audience: z.array(z.string().min(1).max(60)).max(10).default([]),
  problem_solved: z.string().max(1000).default(""),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  time_to_implement: z.string().max(60).default(""),
  tools_used: z.array(z.string().min(1).max(60)).max(20).default([]),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
  cover_image_url: z.string().url().max(500).optional().nullable(),
  seo_title: z.string().max(70).optional().nullable(),
  seo_description: z.string().max(200).optional().nullable(),
  publish: z.boolean().default(true),
});

export const Route = createFileRoute("/api/public/lab/publish")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!authorized(request)) return new Response("Unauthorized", { status: 401 });

        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch (err) {
          return Response.json({ error: "Invalid body", detail: (err as Error).message }, { status: 400 });
        }

        const authorId = process.env["LAB_AUTHOR_ID"];
        if (!authorId) return Response.json({ error: "LAB_AUTHOR_ID not configured" }, { status: 500 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: existing } = await (supabaseAdmin as any)
          .from("newsletter_posts")
          .select("id, slug")
          .eq("slug", parsed.slug)
          .maybeSingle();
        if (existing) {
          return Response.json(
            { error: "Slug already exists", url: `${SITE}/thelab/${existing.slug}` },
            { status: 409 },
          );
        }

        const words = parsed.content.trim().split(/\s+/).filter(Boolean).length;
        const reading_minutes = Math.max(1, Math.round(words / 220));

        const { data: inserted, error } = await (supabaseAdmin as any)
          .from("newsletter_posts")
          .insert({
            slug: parsed.slug,
            title: parsed.title,
            excerpt: parsed.excerpt,
            content: parsed.content,
            post_type: "lab",
            author_id: authorId,
            pain_point: parsed.pain_point,
            audience: parsed.audience,
            problem_solved: parsed.problem_solved,
            difficulty: parsed.difficulty,
            time_to_implement: parsed.time_to_implement,
            tools_used: parsed.tools_used,
            tags: parsed.tags.map((t) => t.trim().toLowerCase()),
            cover_image_url: parsed.cover_image_url ?? null,
            seo_title: parsed.seo_title,
            seo_description: parsed.seo_description,
            reading_minutes,
            published_at: parsed.publish ? new Date().toISOString() : null,
          })
          .select("id, slug")
          .single();

        if (error) return Response.json({ error: error.message }, { status: 500 });

        return Response.json(
          { id: inserted.id, slug: inserted.slug, url: `${SITE}/thelab/${inserted.slug}` },
          { status: 201 },
        );
      },
    },
  },
});
