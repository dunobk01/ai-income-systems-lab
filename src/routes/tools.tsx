import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "AI Tool Stack — AI Income Systems Lab" },
      { name: "description", content: "The opinionated AI tool stack we teach: ChatGPT, Claude, Perplexity, Lovable, n8n and the supporting cast. Click any tool for the full breakdown." },
      { property: "og:title", content: "AI Tool Stack — AI Income Systems Lab" },
      { property: "og:description", content: "The opinionated AI tool stack we teach. Click any tool for the full breakdown of when to use it." },
      { property: "og:url", content: "https://ai-income-systems.com/tools" },
    ],
    links: [{ rel: "canonical", href: "https://ai-income-systems.com/tools" }],
  }),
  component: ToolsLayout,
});

function ToolsLayout() {
  return <Outlet />;
}
