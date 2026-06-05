CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  source text,
  lead_magnet text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX leads_email_lead_magnet_idx ON public.leads (lower(email), lead_magnet);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);