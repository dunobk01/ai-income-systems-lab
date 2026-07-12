import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Tag as TagIcon, Compass } from "lucide-react";
import { listAllBlogPosts, listPublishedPillars } from "@/lib/blog.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ogImageMeta } from "@/lib/og";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — AI Income Systems | Tips, Guides & Real Systems" },
      { name: "description", content: "Real systems, prompts, and playbooks for making money online with AI. Browse by topic or dive into a full guide." },
      { property: "og:title", content: "AI Income Systems Blog" },
      { property: "og:description", content: "Real systems, prompts, and playbooks for making money online with AI." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ai-income-systems.com/blog" },
    
      ...ogImageMeta(),
    ],
    links: [{ rel: "canonical", href: "https://ai-income-systems.com/blog" }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({ queryKey: ["blog", "all"], queryFn: () => listAllBlogPosts() }),
      context.queryClient.ensureQueryData({ queryKey: ["pillars", "published"], queryFn: () => listPublishedPillars() }),
    ]);
    return null;
  },
  component: BlogIndex,
});

function BlogIndex() {
  const posts = useQuery({ queryKey: ["blog", "all"], queryFn: () => listAllBlogPosts() });
  const pillars = useQuery({ queryKey: ["pillars", "published"], queryFn: () => listPublishedPillars() });

  const allPosts = posts.data?.posts ?? [];
  const tags = posts.data?.tags ?? [];
  const pillarList = pillars.data?.pillars ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-6">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            AI Income <span className="text-[color:var(--brand)]">Blog</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Real systems, prompts, playbooks, and breakdowns for building an AI-powered income. Browse by topic or start with a full guide.
          </p>
        </section>

        {pillarList.length > 0 && (
          <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="h-4 w-4 text-[color:var(--brand)]" />
              <h2 className="text-xl font-bold">Start here — pillar guides</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {pillarList.map((p) => (
                <Link
                  key={p.id}
                  to="/guides/$slug"
                  params={{ slug: p.slug }}
                  className="glass rounded-2xl p-6 hover:border-[color:var(--brand)]/40 transition group"
                >
                  <div className="text-xs uppercase tracking-widest text-[color:var(--brand)]">Guide</div>
                  <h3 className="mt-1 text-lg font-bold group-hover:text-[color:var(--brand)] transition">{p.title}</h3>
                  {p.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
                  <div className="mt-3 inline-flex items-center gap-1 text-sm text-[color:var(--brand)]">
                    Open guide <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {tags.length > 0 && (
          <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
            <div className="flex items-center gap-2 mb-3">
              <TagIcon className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Browse by topic</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Link
                  key={t}
                  to="/blog/tag/$tag"
                  params={{ tag: t }}
                  className="rounded-full border border-white/10 bg-white/5 hover:border-[color:var(--brand)]/40 hover:text-[color:var(--brand)] px-3 py-1 text-xs transition"
                >
                  #{t}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          <h2 className="text-2xl font-bold mb-6">All posts</h2>
          {allPosts.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
              First posts coming soon. In the meantime, <Link to="/newsletter" className="text-[color:var(--brand)] underline">join the newsletter</Link>.
            </div>
          ) : (
            <div className="grid gap-4">
              {allPosts.map((p) => (
                <Link
                  key={p.id}
                  to="/newsletter/$slug"
                  params={{ slug: p.slug }}
                  className="glass rounded-2xl p-6 hover:border-[color:var(--brand)]/40 transition group"
                >
                  <div className="text-xs text-muted-foreground">
                    {p.published_at ? new Date(p.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : ""}
                  </div>
                  <h3 className="mt-1 text-xl font-bold group-hover:text-[color:var(--brand)] transition">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>}
                  {(p.tags?.length ?? 0) > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tags!.map((t) => (
                        <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
