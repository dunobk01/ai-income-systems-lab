import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { NewsletterEngagement } from "@/components/newsletter-engagement";
import { LabProse, extractHeadings } from "@/components/lab/lab-prose";
import { CoverPlaceholder } from "@/components/lab/cover-placeholder";
import { LabActions } from "@/components/lab/lab-actions";
import { LabCard } from "@/components/lab/lab-card";
import { getLabPostBySlug, listMySavedIds, listMyLikedIds } from "@/lib/lab.functions";
import { useAuth } from "@/lib/auth-context";
import { ogImageMeta, DEFAULT_OG_IMAGE } from "@/lib/og";

const TRUSTED_HTML_PREFIX = '<div class="lab-post"';

export function sanitizeTrustedLabHtml(content: string) {
  return content
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<script\b[^>]*\/?\s*>/gi, "")
    .replace(/\s+on[a-z][\w:.-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/gi, "");
}

export const Route = createFileRoute("/thelab/$slug")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData({
      queryKey: ["lab", "post", params.slug],
      queryFn: () => getLabPostBySlug({ data: { slug: params.slug } }),
    });
    if (!res.post) throw notFound();
    return res;
  },
  head: ({ loaderData }) => {
    const p = loaderData?.post as any;
    if (!p) return { meta: [{ title: "Build not found — The Lab" }, { name: "robots", content: "noindex" }] };
    const url = `https://ai-income-systems.com/thelab/${p.slug}`;
    const title = p.seo_title || p.title;
    const desc = p.seo_description || p.excerpt || p.problem_solved || "A working AI system you can install today.";
    const published = p.published_at ?? new Date().toISOString();
    return {
      meta: [
        { title: `${title} — The Lab` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "article:published_time", content: published },
        ...ogImageMeta(p.cover_image_url ?? DEFAULT_OG_IMAGE, p.title),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: p.title,
            description: desc,
            datePublished: published,
            dateModified: published,
            author: { "@type": "Person", name: "Dustin", url: "https://ai-income-systems.com" },
            publisher: { "@type": "Organization", name: "AI Income Systems", url: "https://ai-income-systems.com" },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            image: p.cover_image_url ?? DEFAULT_OG_IMAGE,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://ai-income-systems.com/" },
              { "@type": "ListItem", position: 2, name: "The Lab", item: "https://ai-income-systems.com/thelab" },
              { "@type": "ListItem", position: 3, name: p.title, item: url },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold">Build not found</h1>
        <p className="mt-3 text-muted-foreground">That Lab build doesn't exist or isn't published yet.</p>
        <Link to="/thelab" className="mt-6 inline-flex items-center gap-1 text-[color:var(--brand)]">
          <ArrowLeft className="h-4 w-4" /> Back to The Lab
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-4 text-sm text-[color:var(--brand)] underline">
          Try again
        </button>
      </main>
      <SiteFooter />
    </div>
  ),
  component: LabPostPage,
});

function useReadingProgress(ref: React.RefObject<HTMLElement | null>) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const start = el.offsetTop;
      const total = Math.max(el.offsetHeight - window.innerHeight, 1);
      const done = Math.min(Math.max(window.scrollY - start, 0), total);
      setPct((done / total) * 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);
  return pct;
}

function LabPostPage() {
  const params = Route.useParams();
  const { user } = useAuth();
  const savedFn = useServerFn(listMySavedIds);
  const likedFn = useServerFn(listMyLikedIds);
  const articleRef = useRef<HTMLElement>(null);
  const progress = useReadingProgress(articleRef);

  const { data } = useQuery({
    queryKey: ["lab", "post", params.slug],
    queryFn: () => getLabPostBySlug({ data: { slug: params.slug } }),
  });
  const saved = useQuery({
    queryKey: ["lab", "saves", "ids", user?.id ?? "anon"],
    queryFn: () => savedFn({ data: undefined } as never),
    enabled: !!user,
  });
  const liked = useQuery({
    queryKey: ["lab", "likes", "ids", user?.id ?? "anon"],
    queryFn: () => likedFn({ data: undefined } as never),
    enabled: !!user,
  });

  const post = data?.post as any;
  if (!post) return null;

  const related = data?.related ?? [];
  const content = post.content ?? "";
  const isTrustedHtml = content.startsWith(TRUSTED_HTML_PREFIX);
  const headings = isTrustedHtml ? [] : extractHeadings(content);
  const isSaved = (saved.data?.ids ?? []).includes(post.id);
  const isLiked = (liked.data?.ids ?? []).includes(post.id);
  const scrollToComments = () =>
    document.getElementById("lab-comments")?.scrollIntoView({ behavior: "smooth" });

  const actions = (vertical: boolean) => (
    <LabActions
      post={post}
      liked={isLiked}
      saved={isSaved}
      vertical={vertical}
      onComment={scrollToComments}
      invalidateKey={["lab", "post", params.slug]}
    />
  );

  const summaryRow = (label: string, value: string | null) =>
    value ? (
      <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
        <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</dt>
        <dd className="text-sm text-foreground/90">{value}</dd>
      </div>
    ) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="fixed inset-x-0 top-0 z-[60] h-1">
        <div
          className="h-full origin-left"
          style={{ width: `${progress}%`, background: "var(--gradient-brand)" }}
          aria-hidden="true"
        />
      </div>
      <SiteHeader />
      <main className="flex-1">
        <div className="relative h-[42vh] min-h-[260px] w-full overflow-hidden">
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt={`Cover image for ${post.title}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <CoverPlaceholder seed={post.slug} title={post.title} />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, oklch(0.14 0.003 260) 12%, oklch(0.14 0.003 260 / 55%) 60%, transparent)" }}
          />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
              <Link to="/thelab" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> The Lab
              </Link>
              <h1 className="mt-3 max-w-3xl font-display text-3xl font-black tracking-tight sm:text-5xl">
                {post.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <article ref={articleRef} className="min-w-0 max-w-3xl">
            <dl className="glass space-y-3 rounded-xl p-5">
              {summaryRow("Pain point", post.pain_point)}
              {summaryRow("Who it's for", (post.audience ?? []).join(", ") || null)}
              {summaryRow("What it solves", post.problem_solved)}
              {summaryRow("Time to implement", post.time_to_implement)}
              {(post.tools_used ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tools_used.map((t: string) => (
                    <span
                      key={t}
                      className="rounded-md bg-[color:var(--brand)]/10 px-2 py-0.5 font-mono text-[11px] text-[color:var(--brand)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </dl>

            <div className="overflow-x-hidden">
              {isTrustedHtml ? (
                <div
                  className="mt-10"
                  dangerouslySetInnerHTML={{ __html: sanitizeTrustedLabHtml(content) }}
                />
              ) : (
                <LabProse
                  content={content}
                  postSlug={post.slug}
                  midSlot={
                    <div className="glass my-10 rounded-2xl p-6">
                      <h3 className="font-display text-lg font-bold">Get tomorrow's build in your inbox</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Free. One system a day. Unsubscribe anytime.</p>
                      <div className="mt-4 max-w-xl">
                        <NewsletterSignup source="thelab-mid" />
                      </div>
                    </div>
                  }
                />
              )}
            </div>

            <div id="lab-comments">
              <NewsletterEngagement postId={post.id} />
            </div>

            <div className="glass mt-12 rounded-2xl p-6">
              <h3 className="font-display text-lg font-bold">One new build every day</h3>
              <p className="mt-1 text-sm text-muted-foreground">Free. Plain English. No fake income claims.</p>
              <div className="mt-4 max-w-xl">
                <NewsletterSignup source="thelab-end" />
              </div>
            </div>

            {related.length > 0 && (
              <section className="mt-16">
                <h2 className="font-display text-2xl font-bold tracking-tight">Next in The Lab</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((r) => (
                    <LabCard
                      key={r.id}
                      post={r}
                      liked={(liked.data?.ids ?? []).includes(r.id)}
                      saved={(saved.data?.ids ?? []).includes(r.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {headings.length > 0 && (
                <nav aria-label="On this page" className="glass rounded-xl p-4">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    On this page
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a
                          href={`#${h.id}`}
                          className="text-muted-foreground transition hover:text-[color:var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              <div className="glass rounded-xl p-3">{actions(true)}</div>
            </div>
          </aside>
        </div>

        <div className="sticky bottom-0 z-40 border-t border-white/10 bg-background/90 px-4 py-2 backdrop-blur-xl lg:hidden">
          <div className="flex justify-around">{actions(false)}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
