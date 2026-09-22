import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { LabCard, LabCardSkeleton } from "@/components/lab/lab-card";
import { listLabPosts, listMySavedIds, listMyLikedIds } from "@/lib/lab.functions";
import { useAuth } from "@/lib/auth-context";
import { ogImageMeta } from "@/lib/og";

const AUDIENCES = [
  "Small business",
  "Solopreneur",
  "Marketing team",
  "Agency",
  "Creator",
  "Beginner",
  "Advanced",
] as const;

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

const searchSchema = z.object({
  audience: z.string().optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
});

const TITLE = "The Lab — Working AI systems you can install today";
const DESC =
  "A new AI build every day: the pain point, who it's for, the tools, and the steps. Free, plain-English, no fake income claims.";
const URL = "https://ai-income-systems.com/thelab";

export const Route = createFileRoute("/thelab/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      ...ogImageMeta(),
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "The Lab",
          description: DESC,
          url: URL,
          isPartOf: { "@type": "WebSite", name: "AI Income Systems", url: "https://ai-income-systems.com" },
        }),
      },
    ],
  }),
  component: LabWall,
});

function LabWall() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { user } = useAuth();
  const listFn = useServerFn(listLabPosts);
  const savedFn = useServerFn(listMySavedIds);
  const likedFn = useServerFn(listMyLikedIds);

  const filters = {
    audience: search.audience ?? null,
    difficulty: search.difficulty ?? null,
    tag: search.tag ?? null,
    search: search.q ?? null,
  };

  const posts = useQuery({
    queryKey: ["lab", "posts", filters],
    queryFn: () => listFn({ data: filters }),
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

  const savedIds = new Set(saved.data?.ids ?? []);
  const likedIds = new Set(liked.data?.ids ?? []);
  const hasFilters = !!(search.audience || search.difficulty || search.tag || search.q);

  const setSearch = (next: Partial<z.infer<typeof searchSchema>>) =>
    void navigate({ search: (prev) => ({ ...prev, ...next }), replace: true });

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] ${
      active
        ? "border-[color:var(--brand)] bg-[color:var(--brand)]/15 text-[color:var(--brand)]"
        : "border-white/12 text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-hero relative">
          <div aria-hidden="true" className="grid-fade absolute inset-0" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
            <h1 className="font-display text-4xl font-black tracking-tight sm:text-6xl">
              The <span className="text-gradient">Lab</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Working AI systems you can install today. One new build every day — free, no fake income claims.
            </p>
            <div className="mt-6 max-w-xl">
              <NewsletterSignup source="thelab" />
            </div>
          </div>
        </section>

        <div className="sticky top-16 z-40 border-y border-white/5 bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={chip(!hasFilters)}
                onClick={() => void navigate({ search: {}, replace: true })}
              >
                All
              </button>
              {AUDIENCES.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={chip(search.audience === a)}
                  onClick={() => setSearch({ audience: search.audience === a ? undefined : a })}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="lab-difficulty">
                Difficulty
              </label>
              <select
                id="lab-difficulty"
                value={search.difficulty ?? ""}
                onChange={(e) =>
                  setSearch({ difficulty: (e.target.value || undefined) as typeof search.difficulty })
                }
                className="rounded-md border border-white/12 bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
              >
                <option value="">Any difficulty</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d[0]!.toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="lab-search">
                Search builds
              </label>
              <input
                id="lab-search"
                type="search"
                placeholder="Search builds…"
                defaultValue={search.q ?? ""}
                onChange={(e) => setSearch({ q: e.target.value || undefined })}
                className="w-full rounded-md border border-white/12 bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] lg:w-56"
              />
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          {posts.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <LabCardSkeleton key={i} />
              ))}
            </div>
          ) : (posts.data?.posts.length ?? 0) === 0 ? (
            <div className="glass mx-auto max-w-lg rounded-xl p-8 text-center">
              <h2 className="font-display text-xl font-bold">No builds match that yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a wider filter — new builds land every day.
              </p>
              <button
                type="button"
                onClick={() => void navigate({ search: {}, replace: true })}
                className="mt-4 rounded-md border border-[color:var(--brand)]/40 px-4 py-2 text-sm text-[color:var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.data!.posts.map((p) => (
                <LabCard key={p.id} post={p} liked={likedIds.has(p.id)} saved={savedIds.has(p.id)} />
              ))}
            </div>
          )}

          {user && (
            <p className="mt-8 text-sm text-muted-foreground">
              <Link to="/thelab/saved" className="text-[color:var(--brand)] underline">
                View your saved builds
              </Link>
            </p>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
