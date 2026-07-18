import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

type AuthOAuth = {
  getAuthorizationDetails: (id: string) => Promise<{
    data: {
      client?: { name?: string; client_name?: string; redirect_uris?: string[] } | null;
      scopes?: string[];
      redirect_url?: string;
      redirect_to?: string;
    } | null;
    error: { message: string } | null;
  }>;
  approveAuthorization: (id: string) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
  denyAuthorization: (id: string) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
};

function oauthClient(): AuthOAuth {
  return (supabase.auth as unknown as { oauth: AuthOAuth }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/login", search: { redirect: next } });
    }
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthClient().getAuthorizationDetails(id);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="glass max-w-md w-full rounded-2xl p-6 text-center">
        <Logo />
        <h1 className="mt-6 text-xl font-bold">Authorization failed</h1>
        <p className="mt-2 text-sm text-muted-foreground">{String((error as Error)?.message ?? error)}</p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "an app";
  const redirectUri = details?.client?.redirect_uris?.[0];
  const scopes = details?.scopes ?? [];

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const c = oauthClient();
    const { data, error } = approve
      ? await c.approveAuthorization(authorization_id)
      : await c.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect URL returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="glass max-w-md w-full rounded-2xl p-6 space-y-5">
        <Logo />
        <div>
          <h1 className="text-xl font-bold">Connect {clientName} to AI Income Systems Lab</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {clientName} will be able to call this app's tools while you are signed in{email ? ` as ${email}` : ""}.
          </p>
        </div>

        <div className="rounded-lg bg-black/20 p-3 text-xs space-y-1.5">
          {redirectUri && (
            <div>
              <span className="text-muted-foreground">Redirects to:</span> <code>{redirectUri}</code>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Access:</span> read your profile and wins, post new wins on your behalf, and search published content.
          </div>
          {scopes.length > 0 && (
            <div>
              <span className="text-muted-foreground">Requested permissions:</span> {scopes.join(", ")}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          This does not bypass this app's permissions or backend policies. Tools run as your account with your tier and role.
        </p>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <div className="flex gap-2">
          <Button variant="brand" className="flex-1" disabled={busy} onClick={() => decide(true)}>
            {busy ? "Working…" : "Approve"}
          </Button>
          <Button variant="glass" className="flex-1" disabled={busy} onClick={() => decide(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </main>
  );
}
