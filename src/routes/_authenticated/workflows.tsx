import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
export const Route = createFileRoute("/_authenticated/workflows")({
  head: () => ({ meta: [{ title: "n8n Workflows — AI Income Systems Lab" }] }),
  component: () => <StubPage title="n8n Workflow Library" desc="Copy-and-run automation templates for lead delivery, content repurposing, and more." />,
});
