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
  redirect: z.string().optional().default("/dashboard"),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Log in — AI Income Systems Lab" },
      { name: "description", content: "Log in to your AI Income Systems Lab account to access the course, prompt library, and AI builders." },
      { property: "og:title", content: "Log in — AI Income Systems Lab" },
      { property: "og:description", content: "Log in to your AI Income Systems Lab account." },
      { property: "og:url", content: "https://ai-income-systems.com/login" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://ai-income-systems.com/login" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    void navigate({ to: search.redirect ?? "/dashboard", replace: true });
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    void navigate({ to: search.redirect ?? "/dashboard", replace: true });
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) toast.error("Google sign-in failed");
  };

  const onApple = async () => {
    const result = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) toast.error("Apple sign-in failed");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero" />
        <div className="absolute inset-0 -z-10 grid-fade opacity-50" />
        <div className="max-w-md">
          <Logo />
          <h2 className="mt-10 text-4xl font-black tracking-tight leading-tight">
            Welcome back to the <span className="text-gradient">Lab</span>.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pick up where you left off. Your progress, notes, and saved prompts are all waiting.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8"><Logo /></div>
          <h1 className="text-2xl font-bold">Log in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            New here? <Link to="/signup" className="text-foreground hover:underline">Create an account</Link>
          </p>

          <div className="mt-6 grid gap-2">
            <Button onClick={onGoogle} variant="glass" className="w-full h-11">
              <GoogleIcon /> Continue with Google
            </Button>
            <Button onClick={onApple} variant="glass" className="w-full h-11">
              <AppleIcon /> Continue with Apple
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-white/10" /> or <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
            </div>
            <Button type="submit" variant="brand" disabled={submitting} className="w-full h-11">
              {submitting ? "Signing in…" : "Log in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.42 2.22-1.18 3.02-.81.87-2.13 1.55-3.21 1.46-.13-1.12.41-2.25 1.13-2.97.81-.82 2.22-1.43 3.26-1.51zM20.5 17.49c-.56 1.28-.83 1.85-1.55 2.98-1.01 1.58-2.43 3.55-4.19 3.57-1.57.02-1.97-1.02-4.1-1-2.13.01-2.57 1.02-4.14 1-1.76-.02-3.11-1.8-4.12-3.38C-.4 16.84-.7 11.5 1.96 8.7c1.18-1.25 3.04-2.04 4.79-2.04 1.78 0 2.9 1 4.37 1 1.43 0 2.3-1 4.36-1 1.56 0 3.21.85 4.39 2.31-3.86 2.12-3.23 7.63.63 8.52z"/>
    </svg>
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
