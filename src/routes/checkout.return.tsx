import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tiktokTrack } from "@/lib/tiktok";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: ReturnPage,
});

function ReturnPage() {
  const { session_id } = Route.useSearch();
  useEffect(() => {
    if (!session_id) return;
    tiktokTrack("Purchase", {
      contents: [{ content_id: session_id, content_type: "product", content_name: "ai-income-systems-lab" }],
      value: 0,
      currency: "USD",
    });
  }, [session_id]);
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass rounded-3xl p-10 max-w-lg w-full text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>
        <h1 className="mt-6 text-3xl font-black">You're in.</h1>
        <p className="mt-3 text-muted-foreground">
          Your purchase is confirmed and your access is unlocking now. If your dashboard still shows the old tier, refresh in 30 seconds.
        </p>
        {session_id && <p className="mt-2 text-[10px] text-muted-foreground/60 font-mono">Ref: {session_id.slice(0, 18)}…</p>}
        <Button asChild variant="brand" className="mt-7 h-11 w-full">
          <Link to="/dashboard">Go to dashboard <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
