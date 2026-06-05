import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({
    meta: [
      { title: "Unsubscribe — AI Income Systems Lab" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: UnsubscribePage,
});

type State = "loading" | "ready" | "already" | "invalid" | "submitting" | "done" | "error";

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) return setState("invalid");
        if (data.valid === false && data.reason === "already_unsubscribed") return setState("already");
        if (data.valid) return setState("ready");
        setState("invalid");
      })
      .catch(() => setState("error"));
  }, [token]);

  const confirm = async () => {
    setState("submitting");
    try {
      const r = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await r.json();
      if (data.success) setState("done");
      else if (data.reason === "already_unsubscribed") setState("already");
      else setState("error");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="glass-strong rounded-3xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-3">Unsubscribe</h1>
        {state === "loading" && <p className="text-muted-foreground">Checking your link…</p>}
        {state === "invalid" && <p className="text-muted-foreground">This unsubscribe link is invalid or expired.</p>}
        {state === "already" && <p className="text-muted-foreground">You're already unsubscribed. No further emails will be sent.</p>}
        {state === "ready" && (
          <>
            <p className="text-muted-foreground mb-6">Click below to confirm you want to stop receiving emails from AI Income Systems Lab.</p>
            <Button onClick={confirm} variant="brand">Confirm unsubscribe</Button>
          </>
        )}
        {state === "submitting" && <p className="text-muted-foreground">Processing…</p>}
        {state === "done" && <p className="text-muted-foreground">You've been unsubscribed. Sorry to see you go.</p>}
        {state === "error" && <p className="text-muted-foreground">Something went wrong. Please try again later.</p>}
      </div>
    </div>
  );
}
