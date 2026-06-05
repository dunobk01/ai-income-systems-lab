import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLead } from "@/lib/leads.functions";

type Props = {
  source: string;
  leadMagnet?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
};

export function LeadCapture({
  source,
  leadMagnet = "ai-income-starter-kit",
  title = "Not ready to buy? Grab the free starter kit.",
  subtitle = "10 high-leverage prompts + the 1-page “AI Income System” map — sent to your inbox, no spam.",
  cta = "Send me the kit",
}: Props) {
  const fn = useServerFn(submitLead);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setError(null);
    try {
      await fn({ data: { email, source, lead_magnet: leadMagnet } });
      setState("done");
    } catch (err) {
      setState("error");
      setError((err as Error).message ?? "Couldn't sign you up. Try again.");
    }
  };

  return (
    <div className="glass-strong rounded-3xl p-8 sm:p-10 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-50" style={{ background: "var(--gradient-hero)" }} />
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free resource
          </div>
          <h3 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">{subtitle}</p>
        </div>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 md:w-[420px]">
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
            {state === "done" ? "On its way" : cta}
          </Button>
        </form>
      </div>
      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
      {state === "done" && <p className="mt-3 text-xs text-[color:var(--success)]">Thanks — check your inbox in the next few minutes.</p>}
    </div>
  );
}
