import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "search_content",
  title: "Search blog, newsletter & guides",
  description: "Search published blog posts, newsletter issues, and pillar guides on AI Income Systems Lab by title/excerpt.",
  inputSchema: {
    query: z.string().min(1).describe("Search text matched against title and excerpt."),
    post_type: z.enum(["blog", "newsletter", "guide"]).optional().describe("Filter by content type."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 15)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, post_type, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const sb = supabaseForUser(ctx);
    const pattern = `%${query.replace(/[%_]/g, "\\$&")}%`;
    let q = sb
      .from("newsletter_posts")
      .select("id, slug, title, excerpt, post_type, tags, pillar_slug, published_at")
      .not("published_at", "is", null)
      .or(`title.ilike.${pattern},excerpt.ilike.${pattern}`)
      .order("published_at", { ascending: false })
      .limit(limit ?? 15);
    if (post_type) q = q.eq("post_type", post_type);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const results = (data ?? []).map((p) => ({
      ...p,
      url:
        p.post_type === "guide"
          ? `https://ai-income-systems.com/guides/${p.slug}`
          : p.post_type === "newsletter"
            ? `https://ai-income-systems.com/newsletter/${p.slug}`
            : `https://ai-income-systems.com/blog/${p.slug}`,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      structuredContent: { results },
    };
  },
});
