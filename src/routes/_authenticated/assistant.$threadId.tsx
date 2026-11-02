import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useMemo } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AssistantMark, AssistantShell, threadsKey } from "@/components/assistant/assistant-shell";
import { getAssistantMessages } from "@/lib/assistant.functions";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

export const Route = createFileRoute("/_authenticated/assistant/$threadId")({
  head: () => ({
    meta: [
      { title: "AI Assistant chat — AI Income Systems Lab" },
      { name: "description", content: "Chat with your members-only AI assistant." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const load = useServerFn(getAssistantMessages);
  const q = useQuery({
    queryKey: ["assistant-messages", threadId],
    queryFn: () => load({ data: { threadId } }),
    staleTime: Infinity,
  });

  return (
    <AssistantShell activeId={threadId}>
      {q.isLoading && <p className="m-auto text-muted-foreground">Loading chat…</p>}
      {q.isError && <p className="m-auto text-destructive">Could not load this chat.</p>}
      {q.data && !q.data.found && (
        <p className="m-auto text-muted-foreground">
          Chat not found. <Link to="/assistant" className="text-brand underline">Back to chats</Link>
        </p>
      )}
      {q.data?.found && <ChatWindow key={threadId} threadId={threadId} initial={q.data.messages as unknown as UIMessage[]} />}
    </AssistantShell>
  );
}

function parseError(err: Error) {
  try {
    const parsed = JSON.parse(err.message) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    /* not JSON */
  }
  return err.message || "Something went wrong. Please try again.";
}

const SUGGESTIONS = [
  "Help me pick my first AI income route",
  "Explain how to build a lead magnet with AI",
  "Write a cold email offering an AI automation service",
];

function ChatWindow({ threadId, initial }: { threadId: string; initial: UIMessage[] }) {
  const qc = useQueryClient();
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant-chat",
        body: { threadId },
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    [threadId],
  );

  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initial,
    transport,
    onError: (err) => toast.error(parseError(err)),
    onFinish: () => {
      qc.invalidateQueries({ queryKey: threadsKey });
      qc.invalidateQueries({ queryKey: ["assistant-messages", threadId] });
    },
  });

  const busy = status === "submitted" || status === "streaming";
  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
  };

  return (
    <>
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<AssistantMark />}
              title="What are you building today?"
              description="Ask about a lesson, a Lab build, or anything you'd ask ChatGPT."
            >
              <div className="mt-4 flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-lg border border-border px-3 py-2 text-left text-sm hover:border-brand"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent>
                  {m.parts.map((p, i) =>
                    p.type === "text" ? (
                      m.role === "assistant" ? (
                        <MessageResponse key={i}>{p.text}</MessageResponse>
                      ) : (
                        <p key={i} className="whitespace-pre-wrap">{p.text}</p>
                      )
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer>Thinking...</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="mx-auto w-full max-w-3xl p-3">
        <PromptInput onSubmit={(msg) => send(msg.text)}>
          <PromptInputTextarea autoFocus placeholder="Ask the assistant…" />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          AI can make mistakes. Double-check important details.
        </p>
      </div>
    </>
  );
}
