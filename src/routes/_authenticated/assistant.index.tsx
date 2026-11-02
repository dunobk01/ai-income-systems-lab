import { createFileRoute } from "@tanstack/react-router";
import { AssistantMark, AssistantShell } from "@/components/assistant/assistant-shell";

export const Route = createFileRoute("/_authenticated/assistant/")({
  head: () => ({
    meta: [
      { title: "AI Assistant — AI Income Systems Lab" },
      { name: "description", content: "Your members-only AI assistant that knows the course and Lab content." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AssistantHome,
});

function AssistantHome() {
  return (
    <AssistantShell>
      <div className="m-auto max-w-md p-8 text-center">
        <AssistantMark className="mx-auto h-12 w-12 text-lg" />
        <h1 className="mt-4 text-2xl font-bold">AI Assistant</h1>
        <p className="mt-2 text-muted-foreground">
          Ask anything — from explaining a lesson to drafting an offer, email or n8n workflow. Start a new chat to begin.
        </p>
      </div>
    </AssistantShell>
  );
}
