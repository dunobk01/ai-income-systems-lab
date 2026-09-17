-- 1. Durable outbox for MailerLite synchronisation -------------------------
CREATE TABLE IF NOT EXISTS public.mailerlite_sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempt_count integer NOT NULL DEFAULT 0,
  last_error text,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

GRANT ALL ON public.mailerlite_sync_jobs TO service_role;
GRANT SELECT ON public.mailerlite_sync_jobs TO authenticated;

ALTER TABLE public.mailerlite_sync_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role manages sync jobs" ON public.mailerlite_sync_jobs;
CREATE POLICY "service role manages sync jobs"
  ON public.mailerlite_sync_jobs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "admins read sync jobs" ON public.mailerlite_sync_jobs;
CREATE POLICY "admins read sync jobs"
  ON public.mailerlite_sync_jobs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- At most one outstanding job per user + event type.
CREATE UNIQUE INDEX IF NOT EXISTS mailerlite_sync_jobs_open_user_event_idx
  ON public.mailerlite_sync_jobs (user_id, event_type)
  WHERE status IN ('pending', 'failed');

CREATE INDEX IF NOT EXISTS mailerlite_sync_jobs_due_idx
  ON public.mailerlite_sync_jobs (status, next_attempt_at);

CREATE INDEX IF NOT EXISTS mailerlite_sync_jobs_email_idx
  ON public.mailerlite_sync_jobs (lower(email));

DROP TRIGGER IF EXISTS mailerlite_sync_jobs_updated_at ON public.mailerlite_sync_jobs;
CREATE TRIGGER mailerlite_sync_jobs_updated_at
  BEFORE UPDATE ON public.mailerlite_sync_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Stripe webhook idempotency ledger -------------------------------------
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  environment text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.stripe_events TO service_role;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role manages stripe events" ON public.stripe_events;
CREATE POLICY "service role manages stripe events"
  ON public.stripe_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. Provision every new account as a Free member --------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  normalized_email text := lower(trim(COALESCE(NEW.email, '')));
  signup_provider text := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  signup_source text;
  hard_suppressed boolean := false;
BEGIN
  INSERT INTO public.profiles (user_id, display_name, referral_code, tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    public.generate_referral_code(),
    'none'
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  IF normalized_email = '' OR NEW.is_anonymous THEN
    RETURN NEW;
  END IF;

  signup_source := 'account-signup-' || signup_provider;

  -- Local member/lead record (unique on lower(email), lead_magnet).
  INSERT INTO public.leads (email, source, lead_magnet)
  VALUES (normalized_email, signup_source, 'account')
  ON CONFLICT DO NOTHING;

  -- Never resurrect a hard bounce or spam complaint.
  SELECT EXISTS (
    SELECT 1 FROM public.suppressed_emails
    WHERE email = normalized_email AND reason IN ('bounce', 'complaint')
  ) INTO hard_suppressed;

  IF NOT hard_suppressed THEN
    INSERT INTO public.mailerlite_sync_jobs (user_id, email, event_type, payload)
    VALUES (
      NEW.id,
      normalized_email,
      'free_member_signup',
      jsonb_build_object(
        'signup_source', signup_source,
        'signup_provider', signup_provider,
        'account_created_at', COALESCE(NEW.created_at, now()),
        'display_name', NEW.raw_user_meta_data->>'display_name'
      )
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;