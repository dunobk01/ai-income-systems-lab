import { Link } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function StubPage({ title, desc }: { title: string; desc: string }) {
  const { profile } = useAuth();
  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <div className="glass-strong rounded-3xl p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "var(--gradient-soft)" }}>
          <Construction className="h-7 w-7 text-[color:var(--brand-2)]" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{desc}</p>
        <p className="mt-4 text-xs text-muted-foreground">Tier: {profile?.tier ?? "none"}</p>
        <Button asChild variant="glass" className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    </div>
  );
}
