import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug } from "@/lib/newsletter.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { NewsletterEngagement } from "@/components/newsletter-engagement";
import { Linkify } from "@/components/linkify";
import { ogImageMeta, DEFAULT_OG_IMAGE } from "@/lib/og";

export const Route = createFileRoute("/newsletter/$slug")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData({
      queryKey: ["newsletter", "post", params.slug],
      queryFn: () => getPostBySlug({ data: { slug: params.slug } }),
    });
    if (!res.post) throw notFound();
    return res;
  },
  head: ({ loaderData }) => {
    const p = loaderData?.post as any;
    if (!p) return {};
    const url = `https://ai-income-systems.com/newsletter/${p.slug}`;
    const desc = (p.seo_description as string | null) || p.excerpt || p.content.slice(0, 160);
    const seoTitle = (p.seo_title as string | null) || p.title;
    const published = p.published_at ?? new Date().toISOString();
    const articleLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: p.title,
      description: desc,
      datePublished: published,
      dateModified: published,
      author: { "@type": "Person", name: "Dustin", url: "https://ai-income-systems.com" },
      publisher: {
        "@type": "Organization",
        name: "AI Income Systems",
        url: "https://ai-income-systems.com",
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      image: p.cover_image_url ?? DEFAULT_OG_IMAGE,
    };
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://ai-income-systems.com/" },
        { "@type": "ListItem", position: 2, name: "Newsletter", item: "https://ai-income-systems.com/newsletter" },
        { "@type": "ListItem", position: 3, name: p.title, item: url },
      ],
    };
    return {
      meta: [
        { title: `${seoTitle} — AI Income Weekly` },
        { name: "description", content: desc },
        { property: "og:title", content: seoTitle },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "article:published_time", content: published },
        { property: "article:author", content: "Dustin" },
        ...ogImageMeta(p.cover_image_url ?? DEFAULT_OG_IMAGE, p.title),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(articleLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
      ],
    };
  },

  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <h1 className="text-3xl font-bold">Issue not found</h1>
        <p className="mt-3 text-muted-foreground">That newsletter issue doesn't exist or hasn't been published yet.</p>
        <Link to="/newsletter" className="mt-6 inline-flex items-center gap-1 text-[color:var(--brand)]">
          <ArrowLeft className="h-4 w-4" /> Back to all issues
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-4 text-sm text-[color:var(--brand)] underline">Try again</button>
      </main>
      <SiteFooter />
    </div>
  ),
  component: PostPage,
});

function PostPage() {
  const params = Route.useParams();
  const { data } = useQuery({
    queryKey: ["newsletter", "post", params.slug],
    queryFn: () => getPostBySlug({ data: { slug: params.slug } }),
  });
  const post = data?.post;
  if (!post) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 sm:px-6 pt-12 pb-16">
          <Link to="/newsletter" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All issues
          </Link>
          <div className="mt-6 text-xs text-muted-foreground uppercase tracking-widest">
            {post.published_at ? new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : ""}
          </div>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black tracking-tight">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}
          {post.cover_image_url && (
            <img src={post.cover_image_url} alt="" className="mt-8 w-full rounded-2xl border border-white/10" />
          )}
          <div className="mt-10 text-base leading-relaxed text-foreground/90 space-y-5">
            {post.content.split(/\n{2,}/).map((para: string, i: number) => (
              <p key={i} className="whitespace-pre-wrap"><Linkify text={para} /></p>
            ))}
          </div>

          <NewsletterEngagement postId={post.id} />

          <div className="mt-16">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold">Get next week's issue in your inbox</h3>
              <p className="text-sm text-muted-foreground mt-1">Free. One email a week. Unsubscribe anytime.</p>
              <div className="mt-4 max-w-xl">
                <NewsletterSignup source="newsletter-post" />
              </div>
            </div>
          </div>

        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
