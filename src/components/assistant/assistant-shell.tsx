import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";
import { MessageSquarePlus, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { canUseAssistant } from "@/lib/assistant-rules";
import {
  createAssistantThread,
  deleteAssistantThread,
  listAssistantThreads,
} from "@/lib/assistant.functions";

export const threadsKey = ["assistant-threads"] as const;

export function AssistantMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-2 font-black text-primary-foreground ${className}`}
    >
      Ai
    </span>
  );
}

export function AssistantShell({ activeId, children }: { activeId?: string; children: ReactNode }) {
  const { profile, isAdmin, loading } = useAuth();
  const allowed = canUseAssistant(profile?.tier, isAdmin);
  const list = useServerFn(listAssistantThreads);
  const create = useServerFn(createAssistantThread);
  const remove = useServerFn(deleteAssistantThread);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);

  const threads = useQuery({ queryKey: threadsKey, queryFn: () => list(), enabled: allowed });

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  if (!allowed) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <Lock className="mx-auto h-8 w-8 text-brand" />
        <h1 className="mt-4 text-2xl font-bold">AI Assistant is a paid-member feature</h1>
        <p className="mt-2 text-muted-foreground">
          Ask questions, get help with your lessons and Lab builds, and draft prompts, offers and emails. Included with
          Starter, Builder and Accelerator.
        </p>
        <Button asChild className="mt-6">
          <Link to="/pricing">See plans</Link>
        </Button>
      </div>
    );
  }

  const newChat = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const { id } = await create();
      await qc.invalidateQueries({ queryKey: threadsKey });
      navigate({ to: "/assistant/$threadId", params: { threadId: id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start a new chat.");
    } finally {
      setCreating(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this chat?")) return;
    try {
      await remove({ data: { threadId: id } });
      await qc.invalidateQueries({ queryKey: threadsKey });
      if (id === activeId) navigate({ to: "/assistant" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete this chat.");
    }
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-0 flex-col md:flex-row">
      <aside className="flex max-h-48 shrink-0 flex-col border-b border-border md:max-h-none md:w-64 md:border-b-0 md:border-r">
        <div className="p-3">
          <Button onClick={newChat} disabled={creating} className="w-full justify-start gap-2">
            <MessageSquarePlus className="h-4 w-4" /> New chat
          </Button>
          {threads.data && (
            <p className="mt-2 text-xs text-muted-foreground">
              {threads.data.remaining} of {threads.data.limit} messages left today
            </p>
          )}
        </div>
        <nav aria-label="Your chats" className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {threads.isLoading && <p className="px-2 text-sm text-muted-foreground">Loading chats…</p>}
          {threads.isError && <p className="px-2 text-sm text-destructive">Could not load your chats.</p>}
          {threads.data?.threads.length === 0 && (
            <p className="px-2 text-sm text-muted-foreground">No chats yet.</p>
          )}
          <ul className="space-y-1">
            {threads.data?.threads.map((t) => (
              <li key={t.id} className="group flex items-center gap-1">
                <Link
                  to="/assistant/$threadId"
                  params={{ threadId: t.id }}
                  className={`min-w-0 flex-1 truncate rounded-md px-2 py-2 text-sm hover:bg-accent ${
                    t.id === activeId ? "bg-accent text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t.title}
                </Link>
                <button
                  type="button"
                  onClick={() => del(t.id)}
                  aria-label={`Delete chat ${t.title}`}
                  className="rounded p-1.5 text-muted-foreground opacity-60 hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</section>
    </div>
  );
}
