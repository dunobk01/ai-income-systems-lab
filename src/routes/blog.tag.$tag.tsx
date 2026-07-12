import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { listPostsByTag } from "@/lib/blog.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ogImageMeta } from "@/lib/og";

export const Route = createFileRoute("/blog/tag/$tag")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData({
      queryKey: ["blog", "tag", params.tag],
      queryFn: () => listPostsByTag({ data: { tag: params.tag } }),
    });
    if (!res.posts.length) throw notFound();
    return res;
  },
  head: ({ params, loaderData }) => {
    const tag = params.tag;
    const count = loaderData?.posts.length ?? 0;
    const title = `#${tag} — AI Income Systems Blog`;
    const desc = `${count} post${count === 1 ? "" : "s"} on ${tag} — real systems and playbooks for making money with AI.`;
    const url = `https://ai-income-systems.com/blog/tag/${tag}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      
        ...ogImageMeta(),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <h1 className="text-3xl font-bold">No posts for this topic yet</h1>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-1 text-[color:var(--brand)]">
          <ArrowLeft className="h-4 w-4" /> Back to blog
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
  component: TagPage,
});

function TagPage() {
  const params = Route.useParams();
  const { data } = useQuery({
    queryKey: ["blog", "tag", params.tag],
    queryFn: () => listPostsByTag({ data: { tag: params.tag } }),
  });
  const posts = data?.posts ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 pt-12 pb-16">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All posts
        </Link>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          <span className="text-muted-foreground">#</span>{params.tag}
        </h1>
        <p className="mt-2 text-muted-foreground">{posts.length} post{posts.length === 1 ? "" : "s"} on this topic.</p>

        <div className="mt-10 grid gap-4">
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
              <h2 className="mt-1 text-xl font-bold group-hover:text-[color:var(--brand)] transition">{p.title}</h2>
              {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
