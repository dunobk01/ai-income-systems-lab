import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, BookOpen, Wrench, Workflow } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — AI Income Systems Lab" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // If already onboarded, skip straight to the course.
  useEffect(() => {
    if (profile?.onboarded_at) {
      void navigate({ to: "/course", replace: true });
    }
  }, [profile?.onboarded_at, navigate]);

  const onContinue = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({ onboarded_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (!error) await refreshProfile();
    setSubmitting(false);
    void navigate({ to: "/course", replace: true });
  };

  const firstName =
    profile?.display_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] relative grid place-items-center px-6 py-12">
      <div className="absolute inset-0 -z-10 bg-hero" />
      <div className="absolute inset-0 -z-10 grid-fade opacity-40" />

      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-background/60 backdrop-blur-xl p-8 sm:p-12">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-8 text-3xl sm:text-4xl font-black tracking-tight text-center">
          Welcome, <span className="text-gradient">{firstName}</span>.
        </h1>
        <p className="mt-3 text-center text-muted-foreground">
          You're in. Here's what your Lab unlocks — start with the course and dip into the rest as you go.
        </p>

        <ul className="mt-8 grid sm:grid-cols-2 gap-3 text-sm">
          {[
            { icon: BookOpen, title: "The Course", body: "11 modules · 90+ lessons of real-world systems." },
            { icon: Sparkles, title: "Prompt Library", body: "Battle-tested prompts you can copy and remix." },
            { icon: Wrench, title: "Tool Stack", body: "Our curated AI stack with setup guides." },
            { icon: Workflow, title: "n8n Workflows", body: "Importable automations to ship faster." },
          ].map((item) => (
            <li key={item.title} className="flex gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
              <item.icon className="h-5 w-5 mt-0.5 text-foreground/80" />
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-muted-foreground">{item.body}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex justify-center">
          <Button onClick={onContinue} variant="brand" disabled={submitting} className="h-11 px-8">
            {submitting ? "Loading…" : "Go to the course"}
          </Button>
        </div>
      </div>
    </div>
  );
}
