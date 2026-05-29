CREATE OR REPLACE FUNCTION public.apply_subscription_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  highest_tier subscription_tier := 'none';
  r RECORD;
BEGIN
  FOR r IN
    SELECT price_id FROM public.subscriptions
    WHERE user_id = NEW.user_id
      AND status NOT IN ('refunded', 'failed')
  LOOP
    IF r.price_id IN ('pro_onetime', 'ailab_pro_onetime') THEN
      highest_tier := 'pro';
    ELSIF r.price_id IN ('builder_onetime', 'ailab_builder_onetime') AND highest_tier <> 'pro' THEN
      highest_tier := 'builder';
    ELSIF r.price_id IN ('starter_onetime', 'ailab_starter_onetime') AND highest_tier NOT IN ('pro','builder') THEN
      highest_tier := 'starter';
    END IF;
  END LOOP;

  UPDATE public.profiles
  SET tier = highest_tier, updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;