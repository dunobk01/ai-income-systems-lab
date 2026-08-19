CREATE OR REPLACE FUNCTION public.get_permission_diagnostics()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'generated_at', now(),
    'tables', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'name', t.relname,
          'rls_enabled', t.relrowsecurity,
          'rls_forced', t.relforcerowsecurity,
          'grants', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
              'role', g.grantee,
              'privileges', g.privileges
            ) ORDER BY g.grantee)
            FROM (
              SELECT grantee, string_agg(DISTINCT privilege_type, ', ' ORDER BY privilege_type) AS privileges
              FROM information_schema.role_table_grants
              WHERE table_schema = 'public' AND table_name = t.relname
                AND grantee IN ('anon', 'authenticated', 'service_role')
              GROUP BY grantee
            ) g
          ), '[]'::jsonb),
          'policies', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
              'name', p.polname,
              'command', CASE p.polcmd
                WHEN 'r' THEN 'SELECT'
                WHEN 'a' THEN 'INSERT'
                WHEN 'w' THEN 'UPDATE'
                WHEN 'd' THEN 'DELETE'
                WHEN '*' THEN 'ALL'
              END,
              'permissive', p.polpermissive,
              'roles', COALESCE((
                SELECT string_agg(rolname, ', ' ORDER BY rolname)
                FROM pg_authid
                WHERE oid = ANY(p.polroles)
              ), 'PUBLIC'),
              'using', pg_get_expr(p.polqual, p.polrelid),
              'with_check', pg_get_expr(p.polwithcheck, p.polrelid)
            ) ORDER BY p.polname)
            FROM pg_policy p
            WHERE p.polrelid = t.oid
          ), '[]'::jsonb)
        ) ORDER BY t.relname
      ), '[]'::jsonb)
      FROM pg_class t
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public' AND t.relkind = 'r'
    ),
    'functions', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'name', p.proname,
          'security_definer', p.prosecdef,
          'returns_set', p.proretset,
          'owner', pg_get_userbyid(p.proowner),
          'argument_types', COALESCE(pg_get_function_arguments(p.oid), '')
        ) ORDER BY p.proname
      ), '[]'::jsonb)
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_permission_diagnostics() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_permission_diagnostics() TO authenticated;
