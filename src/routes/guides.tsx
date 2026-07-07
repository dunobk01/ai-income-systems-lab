import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Compass } from "lucide-react";
import { listPublishedPillars } from "@/lib/blog.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { title: "Guides — AI Income Systems | Complete Playbooks" },
      { name: "description", content: "In-depth guides on building AI-powered income streams — end-to-end systems, not tips." },
      { property: "og:title", content: "AI Income Systems Guides" },
      { property: "og:description", content: "Complete, end-to-end playbooks for building an AI-powered income." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ai-income-systems.com/guides" },
    ],
    links: [{ rel: "canonical", href: "https://ai-income-systems.com/guides" }],
  }),
  loader: async ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["pillars", "published"],
      queryFn: () => listPublishedPillars(),
    }),
  component: GuidesIndex,
});

function GuidesIndex() {
  const { data } = useQuery({
    queryKey: ["pillars", "published"],
    queryFn: () => listPublishedPillars(),
  });
  const pillars = data?.pillars ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
            <Compass className="h-3.5 w-3.5" /> Pillar Guides
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight">
            Complete <span className="text-[color:var(--brand)]">Playbooks</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Deep, end-to-end guides on the systems that actually generate AI income. Each guide pulls together every related post, prompt, and tool in one place.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          {pillars.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
              First guides are being written. In the meantime, <Link to="/blog" className="text-[color:var(--brand)] underline">browse the blog</Link>.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {pillars.map((p) => (
                <Link
                  key={p.id}
                  to="/guides/$slug"
                  params={{ slug: p.slug }}
                  className="glass rounded-2xl p-6 hover:border-[color:var(--brand)]/40 transition group"
                >
                  <div className="text-xs uppercase tracking-widest text-[color:var(--brand)]">Guide</div>
                  <h2 className="mt-2 text-xl font-bold group-hover:text-[color:var(--brand)] transition">{p.title}</h2>
                  {p.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.description}</p>}
                  <div className="mt-4 inline-flex items-center gap-1 text-sm text-[color:var(--brand)]">
                    Open guide <ArrowRight className="h-4 w-4" />
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
