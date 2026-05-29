import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "./course";
export const Route = createFileRoute("/_authenticated/prompts")({
  head: () => ({ meta: [{ title: "Prompt Library — AI Income Systems Lab" }] }),
  component: () => <StubPage title="Prompt Library" desc="Searchable prompts for ChatGPT, Claude, Perplexity, Lovable, and n8n. Coming in the next build pass." />,
});
