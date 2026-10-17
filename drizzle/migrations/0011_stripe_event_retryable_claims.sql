ALTER TABLE public.stripe_events ADD COLUMN IF NOT EXISTS processing_state text NOT NULL DEFAULT 'complete'; ALTER TABLE public.stripe_events ADD COLUMN IF NOT EXISTS claimed_at timestamptz;
CREATE OR REPLACE FUNCTION public.claim_stripe_event(p_id text, p_type text, p_environment text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_state text; current_claim timestamptz;
BEGIN
 INSERT INTO public.stripe_events(id,event_type,environment,processing_state,claimed_at) VALUES(p_id,p_type,p_environment,'processing',now()) ON CONFLICT(id) DO NOTHING;
 IF FOUND THEN RETURN 'claimed'; END IF;
 SELECT processing_state,claimed_at INTO current_state,current_claim FROM public.stripe_events WHERE id=p_id AND environment=p_environment FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Event environment mismatch'; END IF;
 IF current_state='complete' THEN RETURN 'complete'; END IF;
 IF current_state='processing' AND current_claim > now()-interval '10 minutes' THEN RETURN 'busy'; END IF;
 UPDATE public.stripe_events SET processing_state='processing',claimed_at=now() WHERE id=p_id AND environment=p_environment;
 RETURN 'claimed';
END; $$;
REVOKE ALL ON FUNCTION public.claim_stripe_event(text,text,text) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.claim_stripe_event(text,text,text) TO service_role;