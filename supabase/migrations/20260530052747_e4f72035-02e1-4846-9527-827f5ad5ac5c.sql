GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.user_has_tier(uuid, subscription_tier) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.tier_rank(subscription_tier) TO authenticated, anon;