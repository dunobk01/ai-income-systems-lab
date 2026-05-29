import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({ meta: [{ title: "Progress — AI Income Systems Lab" }] }),
  component: () => <StubPage title="Progress Tracker" desc="See completed lessons, streaks, and module mastery. Activates after course content is seeded." />,
});
