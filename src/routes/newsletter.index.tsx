import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Mail } from "lucide-react";
import { listPublishedPosts } from "@/lib/newsletter.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { ogImageMeta } from "@/lib/og";

export const Route = createFileRoute("/newsletter/")({
  head: () => ({
    meta: [
      { title: "Weekly Newsletter — AI Income Tips & Tricks | AI Income Systems" },
      { name: "description", content: "Weekly tips, tricks, and real systems I'm using to make money online with AI. New issue every week." },
      { property: "og:title", content: "AI Income Weekly — Tips From the Lab" },
      { property: "og:description", content: "Weekly tips and tricks I'm actually using to make money with AI online." },
      { rel: "canonical", href: "https://ai-income-systems.com/newsletter" },
    
      ...ogImageMeta(),
    ],
  }),
  loader: async ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["newsletter", "published"],
      queryFn: () => listPublishedPosts(),
    }),
  component: NewsletterIndex,
});

function NewsletterIndex() {
  const { data } = useQuery({
    queryKey: ["newsletter", "published"],
    queryFn: () => listPublishedPosts(),
  });
  const posts = data?.posts ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" /> Weekly · Free
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight">
            AI Income <span className="text-[color:var(--brand)]">Weekly</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Every week I share one tip, trick, or system I'm actually using to make money online with AI. No fluff, no theory — just what's working right now.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-8">
          <div className="glass-strong rounded-3xl p-8 sm:p-10">
            <h2 className="text-2xl font-bold">Get weekly tips in your inbox</h2>
            <p className="mt-2 text-sm text-muted-foreground">One short email a week. Real systems I'm using. Unsubscribe anytime.</p>
            <div className="mt-5 max-w-xl">
              <NewsletterSignup source="newsletter" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
          <h2 className="text-2xl font-bold mb-6">Recent issues</h2>
          {posts.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
              The first issue is dropping soon. Sign up above to get it in your inbox.
            </div>
          ) : (
            <div className="grid gap-4">
              {posts.map((p) => (
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
                  <div className="mt-3 inline-flex items-center gap-1 text-sm text-[color:var(--brand)]">
                    Read issue <ArrowRight className="h-4 w-4" />
                  </div>
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
