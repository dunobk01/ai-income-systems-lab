-- Add 'monthly' to subscription_tier enum
ALTER TYPE public.subscription_tier ADD VALUE IF NOT EXISTS 'monthly' BEFORE 'starter';

-- Update apply_subscription_tier: monthly counts only while active
CREATE OR REPLACE FUNCTION public.apply_subscription_tier()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  highest_tier subscription_tier := 'none';
  target_user uuid;
  r RECORD;
BEGIN
  target_user := COALESCE(NEW.user_id, OLD.user_id);
  FOR r IN
    SELECT price_id, status FROM public.subscriptions
    WHERE user_id = target_user
  LOOP
    IF r.price_id IN ('pro_onetime', 'ailab_pro_onetime')
       AND r.status NOT IN ('refunded', 'failed') THEN
      highest_tier := 'pro';
    ELSIF r.price_id IN ('builder_onetime', 'ailab_builder_onetime')
       AND r.status NOT IN ('refunded', 'failed')
       AND highest_tier <> 'pro' THEN
      highest_tier := 'builder';
    ELSIF r.price_id IN ('starter_onetime', 'ailab_starter_onetime')
       AND r.status NOT IN ('refunded', 'failed')
       AND highest_tier NOT IN ('pro','builder') THEN
      highest_tier := 'starter';
    ELSIF r.price_id = 'ailab_monthly_subscription'
       AND r.status IN ('active','trialing','past_due')
       AND highest_tier NOT IN ('pro','builder','starter') THEN
      highest_tier := 'monthly';
    END IF;
  END LOOP;

  UPDATE public.profiles
  SET tier = highest_tier, updated_at = now()
  WHERE user_id = target_user;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Ensure trigger covers insert/update/delete so cancellations revoke tier
DROP TRIGGER IF EXISTS subscriptions_apply_tier ON public.subscriptions;
CREATE TRIGGER subscriptions_apply_tier
AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.apply_subscription_tier();

-- Recompute tier for everyone with any subscription row
DO $$
DECLARE u uuid;
BEGIN
  FOR u IN SELECT DISTINCT user_id FROM public.subscriptions LOOP
    UPDATE public.subscriptions SET updated_at = now()
    WHERE user_id = u AND id = (SELECT id FROM public.subscriptions WHERE user_id = u LIMIT 1);
  END LOOP;
END $$;