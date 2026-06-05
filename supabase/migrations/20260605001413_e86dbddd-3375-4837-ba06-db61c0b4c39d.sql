
-- Lock down user_roles: prevent self-promotion to admin
CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Revoke EXECUTE on SECURITY DEFINER functions from anon and (where safe) authenticated.
-- Trigger-only functions: revoke from both anon and authenticated.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_subscription_tier() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;

-- Helper functions used inside RLS policies: revoke from anon (no anon policies use them);
-- keep EXECUTE for authenticated since RLS policies invoke them at query time.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.user_has_tier(uuid, public.subscription_tier) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tier_rank(public.subscription_tier) FROM anon, PUBLIC;
