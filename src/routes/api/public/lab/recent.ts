import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

function authorized(request: Request) {
  const token = process.env["LAB_PUBLISH_TOKEN"];
  if (!token) return false;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/lab/recent")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!authorized(request)) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await (supabaseAdmin as any)
          .from("newsletter_posts")
          .select("title, slug, pain_point, tags")
          .eq("post_type", "lab")
          .order("created_at", { ascending: false })
          .limit(60);

        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ posts: data ?? [] });
      },
    },
  },
});
