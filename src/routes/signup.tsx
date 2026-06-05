import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const searchSchema = z.object({
  tier: z.enum(["starter", "builder", "pro"]).optional(),
});

export const Route = createFileRoute("/signup")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign up — AI Income Systems Lab" },
      { name: "description", content: "Create your AI Income Systems Lab account and start building real AI-powered income systems today." },
      { property: "og:title", content: "Sign up — AI Income Systems Lab" },
      { property: "og:description", content: "Create your account and start building real AI income systems." },
      { property: "og:url", content: "https://ai-income-systems.com/signup" },
    ],
    links: [{ rel: "canonical", href: "https://ai-income-systems.com/signup" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { user, loading } = useAuth();
  const { tier } = Route.useSearch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const postAuthTo = tier ? "/checkout" : "/dashboard";

  if (!loading && user) {
    void navigate({ to: postAuthTo, search: tier ? { tier } : undefined, replace: true });
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + postAuthTo,
        data: { display_name: name },
      },
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created.");
    void navigate({ to: postAuthTo, search: tier ? { tier } : undefined, replace: true });
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + postAuthTo });
    if (result.error) toast.error("Google sign-up failed");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero" />
        <div className="absolute inset-0 -z-10 grid-fade opacity-50" />
        <div className="max-w-md">
          <Logo />
          <h2 className="mt-10 text-4xl font-black tracking-tight leading-tight">
            Start building <span className="text-gradient">real income systems</span>.
          </h2>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>• 11 modules · 90+ lessons</li>
            <li>• Prompt library + interactive builders</li>
            <li>• Lifetime access to your tier</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8"><Logo /></div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Have one? <Link to="/login" className="text-foreground hover:underline">Log in</Link>
          </p>

          <Button onClick={onGoogle} variant="glass" className="mt-6 w-full h-11">
            <GoogleIcon /> Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-white/10" /> or <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Display name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" minLength={8} />
              <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
            </div>
            <Button type="submit" variant="brand" disabled={submitting} className="w-full h-11">
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            By signing up, you agree to our terms. Free preview content — upgrade anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.6 35.8 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
