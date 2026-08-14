import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, ArrowRight, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tierLabel } from "@/lib/access";

/**
 * Showroom view of a premium tool for Free members.
 *
 * Everything about the tool stays visible — what it does, the inputs it takes,
 * what it produces, and a real example of its output. Only the run/export
 * actions are locked, with a clear upgrade path. Enforcement of the actual
 * generation happens server-side.
 */
export function ToolPreview({
  icon,
  eyebrow,
  title,
  subtitle,
  requiredTier,
  inputs,
  produces,
  example,
  lockedActions,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  requiredTier: string;
  inputs: string[];
  produces: string[];
  example: ReactNode;
  lockedActions: string[];
}) {
  const label = tierLabel(requiredTier);
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl shrink-0" style={{ background: "var(--gradient-soft)" }}>
          <span className="text-[color:var(--brand)]">{icon}</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
            <Badge variant="outline" className="text-[10px] uppercase border-white/15">
              <Eye className="h-3 w-3 mr-1" /> Preview
            </Badge>
          </div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold">{title}</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">{subtitle}</p>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <section className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">What you give it</p>
          <ul className="mt-3 space-y-2 text-sm">
            {inputs.map((i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 shrink-0 text-[color:var(--brand)]" />
                <span className="text-foreground/85">{i}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs uppercase tracking-wider text-muted-foreground">What it creates</p>
          <ul className="mt-3 space-y-2 text-sm">
            {produces.map((i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 shrink-0 text-[color:var(--brand-2)]" />
                <span className="text-foreground/85">{i}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Example output</p>
          <div className="mt-3 text-sm text-foreground/80 space-y-3">{example}</div>
        </section>
      </div>

      <div className="mt-6 glass-strong rounded-2xl p-6 ring-brand flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-xl shrink-0" style={{ background: "var(--gradient-soft)" }}>
          <Lock className="h-5 w-5 text-[color:var(--brand)]" />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold">Unlock this with {label}</h2>
          <p className="text-sm text-muted-foreground">
            Locked on your plan: {lockedActions.join(", ")}. Your Free membership keeps the preview and the free
            lessons — upgrade when you're ready to actually run it.
          </p>
        </div>
        <Button asChild variant="brand" className="sm:ml-auto shrink-0">
          <Link to="/pricing">See plans <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
