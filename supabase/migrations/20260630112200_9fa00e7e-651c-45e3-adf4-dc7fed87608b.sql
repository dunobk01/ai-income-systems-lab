
-- tier_rank: include accelerator
CREATE OR REPLACE FUNCTION public.tier_rank(_tier subscription_tier)
RETURNS integer
LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $function$
  SELECT CASE _tier
    WHEN 'none' THEN 0
    WHEN 'monthly' THEN 1
    WHEN 'starter' THEN 1
    WHEN 'builder' THEN 2
    WHEN 'pro' THEN 3
    WHEN 'accelerator' THEN 3
    ELSE 0
  END
$function$;

-- apply_subscription_tier: recognize new monthly/annual price IDs + preserve legacy
CREATE OR REPLACE FUNCTION public.apply_subscription_tier()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  highest_rank integer := 0;
  highest_tier subscription_tier := 'none';
  target_user uuid;
  r RECORD;
  this_tier subscription_tier;
  this_rank integer;
BEGIN
  target_user := COALESCE(NEW.user_id, OLD.user_id);
  FOR r IN
    SELECT price_id, status FROM public.subscriptions WHERE user_id = target_user
  LOOP
    this_tier := NULL;
    IF r.price_id IN ('pro_onetime','ailab_pro_onetime') AND r.status NOT IN ('refunded','failed') THEN
      this_tier := 'pro';
    ELSIF r.price_id IN ('builder_onetime','ailab_builder_onetime') AND r.status NOT IN ('refunded','failed') THEN
      this_tier := 'builder';
    ELSIF r.price_id IN ('starter_onetime','ailab_starter_onetime') AND r.status NOT IN ('refunded','failed') THEN
      this_tier := 'starter';
    ELSIF r.price_id = 'ailab_monthly_subscription' AND r.status IN ('active','trialing','past_due') THEN
      this_tier := 'monthly';
    ELSIF r.price_id IN ('ailab_accelerator_monthly','ailab_accelerator_annual') AND r.status IN ('active','trialing','past_due') THEN
      this_tier := 'accelerator';
    ELSIF r.price_id IN ('ailab_builder_monthly','ailab_builder_annual') AND r.status IN ('active','trialing','past_due') THEN
      this_tier := 'builder';
    ELSIF r.price_id IN ('ailab_starter_monthly','ailab_starter_annual') AND r.status IN ('active','trialing','past_due') THEN
      this_tier := 'starter';
    END IF;

    IF this_tier IS NOT NULL THEN
      this_rank := public.tier_rank(this_tier);
      IF this_rank > highest_rank THEN
        highest_rank := this_rank;
        highest_tier := this_tier;
      END IF;
    END IF;
  END LOOP;

  UPDATE public.profiles SET tier = highest_tier, updated_at = now() WHERE user_id = target_user;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Community: kind column for Wins channel
ALTER TABLE public.community_threads
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'discussion';
CREATE INDEX IF NOT EXISTS community_threads_kind_idx ON public.community_threads(kind);

-- Direct messages (Accelerator+ feature; gated in client by tier check)
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.direct_messages TO authenticated;
GRANT ALL ON public.direct_messages TO service_role;

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "DM participants can read" ON public.direct_messages;
CREATE POLICY "DM participants can read"
  ON public.direct_messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "DM accelerator senders can send" ON public.direct_messages;
CREATE POLICY "DM accelerator senders can send"
  ON public.direct_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.user_has_tier(auth.uid(), 'pro')
    AND sender_id <> recipient_id
  );

DROP POLICY IF EXISTS "DM recipient can mark read" ON public.direct_messages;
CREATE POLICY "DM recipient can mark read"
  ON public.direct_messages FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

CREATE INDEX IF NOT EXISTS direct_messages_pair_idx
  ON public.direct_messages(LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id), created_at DESC);
