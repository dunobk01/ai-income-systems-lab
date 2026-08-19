REVOKE ALL ON FUNCTION public.get_permission_diagnostics() FROM public;
REVOKE ALL ON FUNCTION public.get_permission_diagnostics() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_permission_diagnostics() TO service_role;
