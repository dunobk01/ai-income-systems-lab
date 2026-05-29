import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "./course";
export const Route = createFileRoute("/_authenticated/tools")({
  head: () => ({ meta: [{ title: "AI Tool Stack — AI Income Systems Lab" }] }),
  component: () => <StubPage title="AI Tool Stack Guide" desc="When to use ChatGPT vs Claude vs Perplexity vs Lovable vs n8n — with concrete examples." />,
});
