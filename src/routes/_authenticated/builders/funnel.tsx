import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
export const Route = createFileRoute("/_authenticated/builders/funnel")({
  head: () => ({ meta: [{ title: "Sales Funnel Builder — AI Income Systems Lab" }] }),
  component: () => <StubPage title="Sales Funnel Builder" desc="Pick your offer and traffic source — get a complete funnel map with email sequence and upsell." />,
});
