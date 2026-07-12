import { useEffect, useState, type FormEvent } from "react";
import { X, Gift, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { submitLead } from "@/lib/leads.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const SESSION_KEY = "ails:exit-intent-shown";

export function ExitIntentModal({ source }: { source: string }) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = useServerFn(submitLead);

  useEffect(() => {
    if (loading || user) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;

    let armed = false;
    const armTimer = window.setTimeout(() => { armed = true; }, 8000);

    const onMouseLeave = (e: MouseEvent) => {
      if (!armed) return;
      if (e.clientY > 10) return;
      if ((e.relatedTarget as Node | null) !== null) return;
      trigger();
    };

    const trigger = () => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setOpen(true);
      document.removeEventListener("mouseleave", onMouseLeave);
    };

    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [user, loading]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await submit({ data: { email, source: `exit-intent-${source}`, lead_magnet: "ai-income-starter-kit" } });
      toast.success("Check your inbox — the Starter Kit is on its way.");
      setOpen(false);
    } catch (err) {
      toast.error((err as Error).message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-strong rounded-3xl p-8">
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-3 right-3 p-2 rounded-md hover:bg-white/10 text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="h-12 w-12 rounded-2xl grid place-items-center mb-4" style={{ background: "var(--gradient-brand)" }}>
          <Gift className="h-6 w-6 text-background" />
        </div>
        <h2 className="text-2xl font-black tracking-tight">Wait — grab the Starter Kit</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Free 27-page PDF: the exact AI tool stack, 12 starter prompts, and the shortest path to your first AI-powered income system.
        </p>
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <Input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
          />
          <Button type="submit" variant="brand" className="w-full h-11" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send me the Starter Kit
          </Button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground text-center">No spam. Unsubscribe with one click.</p>
      </div>
    </div>
  );
}
