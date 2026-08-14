import { type ReactNode, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { tierLabel } from "@/lib/access";

type UpgradeInfo = {
  /** What the member tried to do, e.g. "Copy this prompt" */
  action: string;
  /** Tier that unlocks it, e.g. "starter" | "builder" */
  requiredTier: string;
  /** Short benefit lines shown in the dialog. */
  benefits?: string[];
};

/**
 * Polished "Unlock this with <Tier>" dialog used whenever a Free member
 * attempts a paid-only action. No countdowns, no fake scarcity — just what
 * the upgrade includes and a direct link to pricing.
 */
export function UpgradeDialog({
  open,
  onOpenChange,
  info,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  info: UpgradeInfo | null;
}) {
  if (!info) return null;
  const label = tierLabel(info.requiredTier);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="grid h-11 w-11 place-items-center rounded-xl mb-2" style={{ background: "var(--gradient-soft)" }}>
            <Lock className="h-5 w-5 text-[color:var(--brand)]" />
          </div>
          <DialogTitle>Unlock this with {label}</DialogTitle>
          <DialogDescription>
            {info.action} is part of the {label} membership. Your Free account stays yours either way — upgrade
            whenever you're ready to use the full toolset.
          </DialogDescription>
        </DialogHeader>
        {info.benefits && info.benefits.length > 0 && (
          <ul className="space-y-2 text-sm">
            {info.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 shrink-0 text-[color:var(--brand)]" />
                <span className="text-muted-foreground">{b}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          <Button asChild variant="brand" className="flex-1">
            <Link to="/pricing">See plans <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button variant="glass" className="flex-1" onClick={() => onOpenChange(false)}>
            Keep exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Small hook that wires a single dialog instance into any page. */
export function useUpgradePrompt() {
  const [info, setInfo] = useState<UpgradeInfo | null>(null);
  return {
    /** Call to open the upgrade dialog. */
    prompt: (next: UpgradeInfo) => setInfo(next),
    dialog: <UpgradeDialog open={!!info} onOpenChange={(v) => !v && setInfo(null)} info={info} />,
  };
}

/** Inline "locked" strip for premium content that stays visible but unusable. */
export function LockedNotice({
  requiredTier,
  children,
  onUpgrade,
}: {
  requiredTier: string;
  children?: ReactNode;
  onUpgrade?: () => void;
}) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-sm flex flex-col sm:flex-row sm:items-center gap-3">
      <span className="flex items-center gap-2 text-muted-foreground min-w-0">
        <Lock className="h-4 w-4 shrink-0" />
        {children ?? <>Included with {tierLabel(requiredTier)}</>}
      </span>
      {onUpgrade ? (
        <Button size="sm" variant="brand" className="sm:ml-auto shrink-0" onClick={onUpgrade}>
          Unlock
        </Button>
      ) : (
        <Button asChild size="sm" variant="brand" className="sm:ml-auto shrink-0">
          <Link to="/pricing">Unlock</Link>
        </Button>
      )}
    </div>
  );
}
