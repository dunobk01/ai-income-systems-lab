import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

const DISMISS_KEY = "ails:onboarding-checklist-dismissed";

type Step = { id: string; label: string; to: string; done: boolean };

export function OnboardingChecklist() {
  const { user, profile } = useAuth();
  const [dismissed, setDismissed] = useState(true);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDismissed(typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [lessons, wins] = await Promise.all([
        supabase.from("lesson_progress").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", true),
        supabase.from("wins").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if (cancelled) return;
      const displayNameDone = !!(profile?.display_name && profile.display_name.trim() && profile.display_name !== user.email?.split("@")[0]);
      setSteps([
        { id: "profile", label: "Complete your profile", to: "/settings", done: displayNameDone },
        { id: "lesson", label: "Finish your first lesson", to: "/course", done: (lessons.count ?? 0) > 0 },
        { id: "win", label: "Post your first win", to: "/wins", done: (wins.count ?? 0) > 0 },
      ]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, profile]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  if (dismissed || loading || steps.length === 0) return null;
  const completed = steps.filter((s) => s.done).length;
  if (completed === steps.length) return null;

  return (
    <div className="mb-6 relative rounded-2xl glass-strong p-5 sm:p-6 ring-brand">
      <button onClick={dismiss} aria-label="Dismiss" className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-white/10 text-muted-foreground">
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center justify-between mb-3 pr-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-2)]">Get started</p>
          <h3 className="mt-1 font-semibold">Set up your lab ({completed}/{steps.length})</h3>
        </div>
      </div>
      <ul className="space-y-2">
        {steps.map((s) => (
          <li key={s.id}>
            <Link to={s.to} className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 hover:bg-white/5 transition group">
              {s.done ? (
                <CheckCircle2 className="h-5 w-5 text-[color:var(--brand-2)] shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <span className={s.done ? "line-through text-muted-foreground" : "group-hover:text-foreground"}>{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
