import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { STATIC_GUIDES } from "@/lib/guides-content";

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
          { path: "/blog", changefreq: "daily", priority: "0.9" },
          { path: "/guides", changefreq: "weekly", priority: "0.9" },
          { path: "/newsletter", changefreq: "weekly", priority: "0.8" },
          { path: "/faq", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.5" },
          { path: "/privacy", changefreq: "yearly", priority: "0.2" },
          { path: "/terms", changefreq: "yearly", priority: "0.2" },
          { path: "/login", changefreq: "monthly", priority: "0.3" },
          { path: "/signup", changefreq: "monthly", priority: "0.5" },
          { path: "/vs/skool", changefreq: "monthly", priority: "0.75" },
          { path: "/vs/mighty-networks", changefreq: "monthly", priority: "0.75" },
          { path: "/vs/circle", changefreq: "monthly", priority: "0.75" },
        ];

        // Static long-form guides
        for (const g of STATIC_GUIDES) {
          entries.push({
            path: `/guides/${g.slug}`,
            lastmod: g.publishedAt.slice(0, 10),
            changefreq: "monthly",
            priority: "0.85",
          });
        }

        try {
          const sb = createClient<Database>(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
          );

          // Published newsletter posts + blog posts + tag pages
          const { data: posts } = await sb
            .from("newsletter_posts")
            .select("slug, published_at, updated_at, tags, post_type")
            .not("published_at", "is", null)
            .lte("published_at", new Date().toISOString())
            .order("published_at", { ascending: false })
            .limit(1000);
          const tagSet = new Set<string>();
          for (const p of (posts ?? []) as any[]) {
            const isBlog = p.post_type === "blog";
            entries.push({
              path: `${isBlog ? "/blog" : "/newsletter"}/${p.slug}`,
              lastmod: (p.updated_at ?? p.published_at ?? undefined)?.slice(0, 10),
              changefreq: "monthly",
              priority: "0.7",
            });
            for (const t of (p.tags ?? [])) tagSet.add(t);
          }
          for (const t of Array.from(tagSet).sort()) {
            entries.push({ path: `/blog/tag/${t}`, changefreq: "weekly", priority: "0.6" });
          }

          // Pillar guides
          const { data: pillars } = await sb
            .from("blog_pillars")
            .select("slug, published_at, updated_at")
            .not("published_at", "is", null)
            .lte("published_at", new Date().toISOString());
          for (const p of pillars ?? []) {
            entries.push({
              path: `/guides/${p.slug}`,
              lastmod: (p.updated_at ?? p.published_at ?? undefined)?.slice(0, 10),
              changefreq: "monthly",
              priority: "0.8",
            });
          }
        } catch (e) {
          console.error("[sitemap] dynamic fetch failed", e);
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
