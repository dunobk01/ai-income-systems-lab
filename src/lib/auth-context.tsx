import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { FREE_TIER_VALUE, TIER_RANK, type Tier } from "@/lib/member-rules";
import { ensureMemberProvisioned } from "@/lib/members.functions";

export { TIER_RANK };

export const hasTier = (userTier: string | undefined | null, requiredTier: string): boolean =>
  (TIER_RANK[userTier ?? FREE_TIER_VALUE] ?? 0) >= (TIER_RANK[requiredTier] ?? 0);

type Profile = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  tier: Tier;
  onboarded_at: string | null;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const provisionedFor = useRef<string | null>(null);

  /**
   * Repair fallback: the OAuth redirect can interrupt any code that runs right
   * after the sign-in click, so membership is confirmed server-side once per
   * session instead. Never downgrades a paid member.
   */
  const ensureProvisioned = async (uid: string) => {
    if (provisionedFor.current === uid) return;
    provisionedFor.current = uid;
    try {
      const result = await ensureMemberProvisioned({ data: undefined } as never);
      if (result?.repaired?.profile || result?.repaired?.sync) {
        await loadProfile(uid);
      }
    } catch {
      // Non-fatal: the scheduled worker repairs anything missed here.
      provisionedFor.current = null;
    }
  };

  const loadProfile = async (uid: string) => {
    const [{ data: p }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("user_id, display_name, avatar_url, tier, onboarded_at").eq("user_id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile(p as Profile | null);
    setIsAdmin(!!roles?.some((r) => r.role === "admin"));
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // Defer to avoid recursive auth events
        setTimeout(() => {
          void loadProfile(s.user.id);
          void ensureProvisioned(s.user.id);
        }, 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
        provisionedFor.current = null;
      }
    });

    void (async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await loadProfile(s.user.id);
        void ensureProvisioned(s.user.id);
      }
      setLoading(false);
    })();

    return () => subscription.unsubscribe();
  }, []);

  // Live-sync profile.tier when the webhook updates it (purchase or refund),
  // so locked routes unlock/relock without a manual refresh.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`profile-tier-${user.id}`, { config: { private: true } })
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        () => { void loadProfile(user.id); },
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user]);

  const value: AuthContextValue = {
    user,
    session,
    profile,
    isAdmin,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
    },
    refreshProfile: async () => {
      if (user) await loadProfile(user.id);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
