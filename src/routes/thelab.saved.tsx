import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LabCard, LabCardSkeleton } from "@/components/lab/lab-card";
import { listMySaves, listMyLikedIds } from "@/lib/lab.functions";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/thelab/saved")({
  head: () => ({
    meta: [
      { title: "Saved builds — The Lab" },
      { name: "description", content: "The Lab builds you saved to install later." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Saved builds — The Lab" },
      { property: "og:description", content: "The Lab builds you saved to install later." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { user, loading } = useAuth();
  const savesFn = useServerFn(listMySaves);
  const likedFn = useServerFn(listMyLikedIds);

  const saves = useQuery({
    queryKey: ["lab", "saves", user?.id ?? "anon"],
    queryFn: () => savesFn({ data: undefined } as never),
    enabled: !!user,
  });
  const liked = useQuery({
    queryKey: ["lab", "likes", "ids", user?.id ?? "anon"],
    queryFn: () => likedFn({ data: undefined } as never),
    enabled: !!user,
  });
  const likedIds = new Set(liked.data?.ids ?? []);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">Saved builds</h1>
        <p className="mt-2 text-muted-foreground">Everything you bookmarked in The Lab.</p>

        {!user && !loading ? (
          <p className="mt-8 text-sm">
            <Link to="/login" search={{ redirect: "/thelab/saved" }} className="text-[color:var(--brand)] underline">
              Sign in
            </Link>{" "}
            to see your saved builds.
          </p>
        ) : saves.isLoading || loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <LabCardSkeleton key={i} />
            ))}
          </div>
        ) : (saves.data?.posts.length ?? 0) === 0 ? (
          <div className="glass mt-8 max-w-lg rounded-xl p-8">
            <p className="text-sm text-muted-foreground">
              Nothing saved yet. Tap the bookmark on any build in{" "}
              <Link to="/thelab" className="text-[color:var(--brand)] underline">
                The Lab
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {saves.data!.posts.map((p) => (
              <LabCard key={p.id} post={p} liked={likedIds.has(p.id)} saved />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
