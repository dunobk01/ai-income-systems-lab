
REVOKE EXECUTE ON FUNCTION public.user_has_tier(uuid, subscription_tier) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tier_rank(subscription_tier) FROM PUBLIC, anon, authenticated;
