import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TableGrant = {
  role: string;
  privileges: string;
};

export type TablePolicy = {
  name: string;
  command: string;
  permissive: boolean;
  roles: string;
  using: string | null;
  with_check: string | null;
};

export type TableDiagnostics = {
  name: string;
  rls_enabled: boolean;
  rls_forced: boolean;
  grants: TableGrant[];
  policies: TablePolicy[];
};

export type FunctionDiagnostics = {
  name: string;
  security_definer: boolean;
  returns_set: boolean;
  owner: string;
  argument_types: string;
};

export type PermissionDiagnostics = {
  generated_at: string;
  tables: TableDiagnostics[];
  functions: FunctionDiagnostics[];
};

/**
 * Admin-only server function that returns a read-only snapshot of database
 * permissions: RLS status, table grants, policies, and security-definer
 * functions. The call is gated to admins and uses the service role to read
 * catalog metadata.
 */
export const getPermissionDiagnostics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);

    if (!roles?.some((r) => r.role === "admin")) {
      throw new Error("Admin only");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("get_permission_diagnostics");
    if (error) throw error;
    return (data ?? { generated_at: new Date().toISOString(), tables: [], functions: [] }) as PermissionDiagnostics;
  });
