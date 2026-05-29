-- Drop dead purchases table (replaced by subscriptions)
DROP TABLE IF EXISTS public.purchases CASCADE;

-- Track amount + currency on each purchase
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS amount_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'usd';

-- Recompute tier from all non-refunded purchases.
-- Handles upgrades AND refund-driven downgrades.
CREATE OR REPLACE FUNCTION public.apply_subscription_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  highest_tier subscription_tier := 'none';
  r record;
BEGIN
  FOR r IN
    SELECT price_id FROM public.subscriptions
    WHERE user_id = NEW.user_id
      AND status IN ('active','trialing','complete','paid')
  LOOP
    IF r.price_id = 'pro_onetime' THEN
      highest_tier := 'pro';
    ELSIF r.price_id = 'builder_onetime' AND highest_tier <> 'pro' THEN
      highest_tier := 'builder';
    ELSIF r.price_id = 'starter_onetime' AND highest_tier NOT IN ('pro','builder') THEN
      highest_tier := 'starter';
    END IF;
  END LOOP;

  UPDATE public.profiles
  SET tier = highest_tier, updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;