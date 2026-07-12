import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SITE_URL = "https://ai-income-systems.com";

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

export type NewsletterPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published_at: string | null;
  email_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

/* ---------------- Public ---------------- */

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = serverPublic();
  const { data, error } = await sb
    .from("newsletter_posts")
    .select("id, slug, title, excerpt, cover_image_url, published_at")
    .eq("post_type" as any, "newsletter")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return { posts: data ?? [] };
});

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = serverPublic();
    const { data: post, error } = await sb
      .from("newsletter_posts")
      .select("id, slug, title, excerpt, content, cover_image_url, published_at")
      .eq("slug", data.slug)
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { post };
  });

/* ---------------- Admin ---------------- */

export const listAllPostsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await (context.supabase as any)
      .from("newsletter_posts")
      .select("id, slug, title, excerpt, published_at, email_sent_at, updated_at, created_at, post_type")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { posts: (data ?? []) as any[] };
  });

export const getPostAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: post, error } = await context.supabase
      .from("newsletter_posts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { post };
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, dashes only"),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().max(50000),
  cover_image_url: z.string().url().max(500).optional().nullable(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional().default([]),
  pillar_slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional().nullable(),
  post_type: z.enum(["newsletter", "blog"]).optional().default("newsletter"),
});

export const upsertPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => upsertSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const row = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt ?? null,
      content: data.content,
      cover_image_url: data.cover_image_url ?? null,
      tags: (data.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean),
      pillar_slug: data.pillar_slug ?? null,
      post_type: data.post_type ?? "newsletter",
      author_id: context.userId,
    };
    if (data.id) {
      const { data: updated, error } = await (context.supabase as any)
        .from("newsletter_posts")
        .update(row)
        .eq("id", data.id)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { id: updated.id };
    } else {
      const { data: inserted, error } = await (context.supabase as any)
        .from("newsletter_posts")
        .insert(row)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { id: inserted.id };
    }
  });


export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("newsletter_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unpublishPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("newsletter_posts")
      .update({ published_at: null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- Publish + send via MailerLite ---------------- */

async function sendMailerLiteCampaign(post: {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
}) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) return { ok: false, reason: "MAILERLITE_API_KEY missing" };

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  // Find target group
  let groupId: string | undefined;
  try {
    const r = await fetch("https://connect.mailerlite.com/api/groups", { headers });
    if (r.ok) {
      const j = (await r.json()) as { data?: Array<{ id: string; name: string }> };
      groupId = j.data?.find((g) => g.name === "AI-Income-Systems Leads 1")?.id;
    }
  } catch {}
  if (!groupId) return { ok: false, reason: "MailerLite group not found" };

  const url = `${SITE_URL}/newsletter/${post.slug}`;
  const paragraphs = post.content
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6;color:#1f2937;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
    <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin:0 0 8px;">AI Income Systems · Weekly Tip</p>
    <h1 style="font-size:26px;line-height:1.25;margin:0 0 16px;color:#0f172a;">${escapeHtml(post.title)}</h1>
    ${post.excerpt ? `<p style="font-size:16px;color:#475569;margin:0 0 24px;">${escapeHtml(post.excerpt)}</p>` : ""}
    ${paragraphs}
    <div style="margin:28px 0;">
      <a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;">Read on the site →</a>
    </div>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 16px;">
    <p style="font-size:12px;color:#94a3b8;margin:0;">You're getting this because you joined the AI Income Systems list. <a href="{$unsubscribe}" style="color:#94a3b8;">Unsubscribe</a>.</p>
  </div>
</body></html>`;

  // Create campaign
  const createRes = await fetch("https://connect.mailerlite.com/api/campaigns", {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: `Newsletter — ${post.title}`.slice(0, 100),
      type: "regular",
      language_id: 9,
      groups: [groupId],
      emails: [
        {
          subject: post.title.slice(0, 150),
          from_name: "Dustin — AI Income Systems",
          from: "notify@ai-income-systems.com",
          content: html,
        },
      ],
    }),
  });
  if (!createRes.ok) {
    const body = await createRes.text();
    console.error("[mailerlite] create campaign failed", createRes.status, body);
    return { ok: false, reason: `create ${createRes.status}` };
  }
  const created = (await createRes.json()) as { data?: { id: string } };
  const campaignId = created.data?.id;
  if (!campaignId) return { ok: false, reason: "no campaign id" };

  // Send instantly
  const sendRes = await fetch(`https://connect.mailerlite.com/api/campaigns/${campaignId}/schedule`, {
    method: "POST",
    headers,
    body: JSON.stringify({ delivery: "instant" }),
  });
  if (!sendRes.ok) {
    const body = await sendRes.text();
    console.error("[mailerlite] schedule failed", sendRes.status, body);
    return { ok: false, reason: `schedule ${sendRes.status}` };
  }
  return { ok: true };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}

export const publishPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), sendEmail: z.boolean().default(true) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);

    // Mark published if not already
    const { data: post, error: getErr } = await context.supabase
      .from("newsletter_posts")
      .select("id, slug, title, excerpt, content, published_at, email_sent_at")
      .eq("id", data.id)
      .single();
    if (getErr || !post) throw new Error(getErr?.message ?? "Post not found");

    if (!post.published_at) {
      const { error: pubErr } = await context.supabase
        .from("newsletter_posts")
        .update({ published_at: new Date().toISOString() })
        .eq("id", data.id);
      if (pubErr) throw new Error(pubErr.message);
    }

    let emailResult: { ok: boolean; reason?: string } = { ok: false, reason: "skipped" };
    if (data.sendEmail && !post.email_sent_at) {
      emailResult = await sendMailerLiteCampaign({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
      });
      if (emailResult.ok) {
        await context.supabase
          .from("newsletter_posts")
          .update({ email_sent_at: new Date().toISOString() })
          .eq("id", data.id);
      }
    }

    return { ok: true, email: emailResult };
  });
