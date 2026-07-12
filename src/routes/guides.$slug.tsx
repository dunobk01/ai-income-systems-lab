import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPillarBySlug } from "@/lib/blog.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Linkify } from "@/components/linkify";
import { GuideView } from "@/components/guide-view";
import { getStaticGuideBySlug } from "@/lib/guides-content";
import { ogImageMeta, DEFAULT_OG_IMAGE } from "@/lib/og";

export const Route = createFileRoute("/guides/$slug")({
  loader: async ({ context, params }) => {
    // Static guides take precedence — they are hand-written pillar guides.
    const staticGuide = getStaticGuideBySlug(params.slug);
    if (staticGuide) return { kind: "static" as const, staticGuide };

    const res = await context.queryClient.ensureQueryData({
      queryKey: ["pillar", params.slug],
      queryFn: () => getPillarBySlug({ data: { slug: params.slug } }),
    });
    if (!res.pillar) throw notFound();
    return { kind: "pillar" as const, ...res };
  },
  head: ({ params, loaderData }) => {
    // Static-guide metadata
    if (loaderData?.kind === "static") {
      const g = loaderData.staticGuide;
      const url = `https://ai-income-systems.com/guides/${g.slug}`;
      const articleLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: g.title,
        description: g.description,
        datePublished: g.publishedAt,
        dateModified: g.publishedAt,
        author: { "@type": "Person", name: "Dustin", url: "https://ai-income-systems.com" },
        publisher: { "@type": "Organization", name: "AI Income Systems", url: "https://ai-income-systems.com" },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      };
      const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://ai-income-systems.com/" },
          { "@type": "ListItem", position: 2, name: "Guides", item: "https://ai-income-systems.com/guides" },
          { "@type": "ListItem", position: 3, name: g.title, item: url },
        ],
      };
      return {
        meta: [
          { title: `${g.title} | AI Income Systems` },
          { name: "description", content: g.description },
          { property: "og:title", content: g.title },
          { property: "og:description", content: g.description },
          { property: "og:type", content: "article" },
          { property: "og:url", content: url },
          { name: "twitter:card", content: "summary" },
          { name: "twitter:title", content: g.title },
          { name: "twitter:description", content: g.description },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          { type: "application/ld+json", children: JSON.stringify(articleLd) },
          { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
        ],
      };
    }

    const p = loaderData?.kind === "pillar" ? loaderData.pillar : null;
    if (!p) return { meta: [{ title: "Guide" }, { name: "robots", content: "noindex" }] };
    const url = `https://ai-income-systems.com/guides/${p.slug}`;
    const desc = p.description ?? `Complete guide to ${p.title}.`;
    const articleLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: p.title,
      description: desc,
      datePublished: p.published_at,
      dateModified: p.published_at,
      author: { "@type": "Person", name: "Dustin", url: "https://ai-income-systems.com" },
      publisher: { "@type": "Organization", name: "AI Income Systems", url: "https://ai-income-systems.com" },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      ...(p.cover_image_url ? { image: p.cover_image_url } : {}),
    };
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://ai-income-systems.com/" },
        { "@type": "ListItem", position: 2, name: "Guides", item: "https://ai-income-systems.com/guides" },
        { "@type": "ListItem", position: 3, name: p.title, item: url },
      ],
    };
    return {
      meta: [
        { title: `${p.title} — Complete Guide | AI Income Systems` },
        { name: "description", content: desc },
        { property: "og:title", content: p.title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
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
        <h1 className="text-3xl font-bold">Guide not found</h1>
        <Link to="/guides" className="mt-6 inline-flex items-center gap-1 text-[color:var(--brand)]">
          <ArrowLeft className="h-4 w-4" /> All guides
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </main>
      <SiteFooter />
    </div>
  ),
  component: GuideRouteComponent,
});

function GuideRouteComponent() {
  const params = Route.useParams();
  const staticGuide = getStaticGuideBySlug(params.slug);

  if (staticGuide) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">
          <GuideView guide={staticGuide} />
        </main>
        <SiteFooter />
      </div>
    );
  }

  return <PillarPage />;
}

function PillarPage() {
  const params = Route.useParams();
  const { data } = useQuery({
    queryKey: ["pillar", params.slug],
    queryFn: () => getPillarBySlug({ data: { slug: params.slug } }),
  });
  const pillar = data?.pillar;
  const posts = data?.posts ?? [];
  if (!pillar) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 pt-12 pb-16">
        <Link to="/guides" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All guides
        </Link>
        <div className="mt-6 text-xs uppercase tracking-widest text-[color:var(--brand)]">Pillar Guide</div>
        <h1 className="mt-2 text-4xl sm:text-5xl font-black tracking-tight">{pillar.title}</h1>
        {pillar.description && <p className="mt-4 text-lg text-muted-foreground">{pillar.description}</p>}
        {pillar.cover_image_url && (
          <img src={pillar.cover_image_url} alt="" className="mt-8 w-full rounded-2xl border border-white/10" />
        )}

        {pillar.intro && (
          <div className="mt-10 text-base leading-relaxed text-foreground/90 space-y-5">
            {pillar.intro.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="whitespace-pre-wrap"><Linkify text={para} /></p>
            ))}
          </div>
        )}

        <section className="mt-14">
          <h2 className="text-2xl font-bold">Everything in this guide</h2>
          <p className="mt-1 text-sm text-muted-foreground">{posts.length} post{posts.length === 1 ? "" : "s"} in this pillar.</p>
          {posts.length === 0 ? (
            <div className="mt-6 glass rounded-2xl p-8 text-center text-muted-foreground">
              Posts are being written for this guide.
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {posts.map((p, i) => (
                <Link
                  key={p.id}
                  to="/newsletter/$slug"
                  params={{ slug: p.slug }}
                  className="glass rounded-2xl p-5 hover:border-[color:var(--brand)]/40 transition group flex items-start gap-4"
                >
                  <div className="text-2xl font-black text-[color:var(--brand)]/50 w-8">{String(i + 1).padStart(2, "0")}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold group-hover:text-[color:var(--brand)] transition">{p.title}</h3>
                    {p.excerpt && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[color:var(--brand)] mt-2" />
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
