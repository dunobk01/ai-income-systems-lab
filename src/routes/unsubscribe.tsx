import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ogImageMeta } from "@/lib/og";
import { unsubscribeByEmail } from "@/lib/leads.functions";

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({
    meta: [
      { title: "Unsubscribe — AI Income Systems Lab" },
      {
        name: "description",
        content: "Stop receiving emails from AI Income Systems Lab. One click, no questions asked.",
      },
      { name: "robots", content: "noindex" },
      ...ogImageMeta(),
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
    email: typeof search.email === "string" ? search.email : "",
  }),
  component: UnsubscribePage,
});

type State = "loading" | "ready" | "already" | "invalid" | "submitting" | "done" | "error";

function UnsubscribePage() {
  const { token, email: emailParam } = Route.useSearch();

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="glass-strong rounded-3xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-3 text-center">Unsubscribe</h1>
        {token ? <TokenFlow token={token} /> : <EmailFlow initialEmail={emailParam} />}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Changed your mind?{" "}
          <Link to="/" className="hover:text-foreground underline">
            Back to AI Income Systems Lab
          </Link>
        </p>
      </div>
    </div>
  );
}

function TokenFlow({ token }: { token: string }) {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
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
    <div className="text-center">
      {state === "loading" && <p className="text-muted-foreground">Checking your link…</p>}
      {state === "invalid" && (
        <>
          <p className="text-muted-foreground mb-6">
            This unsubscribe link is invalid or expired. Enter your email below instead.
          </p>
          <EmailFlow initialEmail="" />
        </>
      )}
      {state === "already" && (
        <p className="text-muted-foreground">You're already unsubscribed. No further emails will be sent.</p>
      )}
      {state === "ready" && (
        <>
          <p className="text-muted-foreground mb-6">
            Click below to confirm you want to stop receiving emails from AI Income Systems Lab.
          </p>
          <Button onClick={confirm} variant="brand">
            Confirm unsubscribe
          </Button>
        </>
      )}
      {state === "submitting" && <p className="text-muted-foreground">Processing…</p>}
      {state === "done" && <p className="text-muted-foreground">You've been unsubscribed. Sorry to see you go.</p>}
      {state === "error" && <p className="text-muted-foreground">Something went wrong. Please try again later.</p>}
    </div>
  );
}

function EmailFlow({ initialEmail }: { initialEmail: string }) {
  const fn = useServerFn(unsubscribeByEmail);
  const [email, setEmail] = useState(initialEmail);
  const [company, setCompany] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      await fn({ data: { email, company } });
      setState("done");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <p className="text-center text-muted-foreground">
        Done — <span className="text-foreground">{email}</span> has been unsubscribed. It can take a few minutes
        for any already-queued email to stop.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        Enter the email address you'd like removed from all AI Income Systems Lab emails.
      </p>
      <div>
        <Label htmlFor="unsub-email">Email address</Label>
        <Input
          id="unsub-email"
          type="email"
          required
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading"}
          className="mt-1.5"
        />
      </div>
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <Button type="submit" variant="brand" className="w-full" disabled={state === "loading"}>
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Unsubscribe me
      </Button>
      {state === "error" && (
        <p className="text-xs text-red-300 text-center">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
