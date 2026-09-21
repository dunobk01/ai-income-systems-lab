import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { TryAnotherTools } from "@/components/free-tools/tool-cards";
import { ReportView } from "@/components/free-tools/report-view";
import { getToolReport } from "@/lib/tool-leads.functions";
import { freeToolBySlug } from "@/lib/free-tools-data";
import { ogImageMeta } from "@/lib/og";

const TITLE = "Your free AI report";
const DESC = "Your saved report from the AI Income Systems free tools — automations to run first, with the tools and prompts to do it.";

export const Route = createFileRoute("/free-tools/r/$token")({
  loader: ({ params }) => getToolReport({ data: { token: params.token } }),
  head: () => ({
    meta: [
      { title: `${TITLE} — AI Income Systems` },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      ...ogImageMeta(),
    ],
  }),
  errorComponent: () => <NotFoundState />,
  notFoundComponent: () => <NotFoundState />,
  component: ReportPage,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-12 pb-16">{children}</section>
      <SiteFooter />
    </div>
  );
}

function NotFoundState() {
  return (
    <Shell>
      <div className="glass-strong rounded-3xl p-6 sm:p-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">We couldn't find that report</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The link may be mistyped or very old. The good news: running the tool again takes about two minutes and the
          new report is yours to keep.
        </p>
        <Button asChild variant="brand" className="mt-6 h-11 px-6">
          <Link to="/free-tools">
            Browse the free tools <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <TryAnotherTools exclude="" />
    </Shell>
  );
}

function ReportPage() {
  const data = Route.useLoaderData();
  if (!data) return <NotFoundState />;

  const tool = freeToolBySlug(data.tool_slug);
  const when = new Date(data.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Shell>
      <div className="space-y-6">
        <div className="glass-strong rounded-3xl p-5 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> {tool?.name ?? "Free tool"} · {when}
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight">
            {data.first_name ? `${data.first_name}, here's your report` : "Here's your report"}
          </h1>
          {data.result_summary && <p className="mt-2 text-sm text-muted-foreground">{data.result_summary}</p>}
        </div>

        <div className="glass-strong rounded-3xl p-5 sm:p-8">
          <ReportView toolSlug={data.tool_slug} report={data.report_json} />
        </div>

        <div className="glass-strong rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="text-xl sm:text-2xl font-bold">Want the systems behind this report?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The Lab walks you through building these automations step by step — templates included.
          </p>
          <Button asChild size="lg" variant="brand" className="mt-5 h-12 px-7">
            <Link to="/pricing">
              See pricing <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <TryAnotherTools exclude={data.tool_slug} />
      </div>
    </Shell>
  );
}
