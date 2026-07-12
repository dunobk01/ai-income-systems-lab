import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLead } from "@/lib/leads.functions";
import { tiktokIdentify, tiktokTrack } from "@/lib/tiktok";
import { dlLead } from "@/lib/datalayer";
import { pinLead } from "@/lib/pinterest";

export function NewsletterSignup({ source = "newsletter" }: { source?: string }) {
  const fn = useServerFn(submitLead);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setError(null);
    try {
      await fn({ data: { email, source, lead_magnet: "weekly-newsletter" } });
      setState("done");
      void tiktokIdentify({ email });
      tiktokTrack("Lead", { value: 0, currency: "USD" });
      dlLead({ lead_source: source, lead_magnet: "weekly-newsletter" });
    } catch (err) {
      setState("error");
      setError((err as Error).message ?? "Couldn't sign you up. Try again.");
    }
  };

  return (
    <div>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          required
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading" || state === "done"}
          className="h-11"
        />
        <Button type="submit" variant="brand" disabled={state === "loading" || state === "done"} className="h-11 px-5 whitespace-nowrap">
          {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "done" ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          {state === "done" ? "You're in" : "Subscribe free"}
        </Button>
      </form>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      {state === "done" && (
        <p className="mt-2 text-xs text-muted-foreground">Look out for the next weekly issue in your inbox.</p>
      )}
    </div>
  );
}
