import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BASE_URL = "https://ai-income-systems.com";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/pricing", changefreq: "weekly", priority: "0.9" },
          { path: "/curriculum", changefreq: "weekly", priority: "0.8" },
          { path: "/tools", changefreq: "weekly", priority: "0.7" },
          { path: "/newsletter", changefreq: "weekly", priority: "0.8" },
          { path: "/faq", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.5" },
          { path: "/privacy", changefreq: "yearly", priority: "0.2" },
          { path: "/terms", changefreq: "yearly", priority: "0.2" },
          { path: "/login", changefreq: "monthly", priority: "0.3" },
          { path: "/signup", changefreq: "monthly", priority: "0.5" },
        ];

        // Dynamic: published newsletter posts
        try {
          const sb = createClient<Database>(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
          );
          const { data } = await sb
            .from("newsletter_posts")
            .select("slug, published_at, updated_at")
            .not("published_at", "is", null)
            .lte("published_at", new Date().toISOString())
            .order("published_at", { ascending: false })
            .limit(1000);
          for (const p of data ?? []) {
            entries.push({
              path: `/newsletter/${p.slug}`,
              lastmod: (p.updated_at ?? p.published_at ?? undefined)?.slice(0, 10),
              changefreq: "monthly",
              priority: "0.7",
            });
          }
        } catch (e) {
          console.error("[sitemap] newsletter fetch failed", e);
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
