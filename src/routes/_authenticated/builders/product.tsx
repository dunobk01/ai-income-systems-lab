import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
export const Route = createFileRoute("/_authenticated/builders/product")({
  head: () => ({ meta: [{ title: "Digital Product Builder — AI Income Systems Lab" }] }),
  component: () => <StubPage title="Digital Product Builder" desc="Enter your niche, audience, and problem — generate a full product plan with sales page outline." />,
});
