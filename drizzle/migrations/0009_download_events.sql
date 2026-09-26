CREATE TABLE public.download_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource text NOT NULL CHECK (resource IN ('ai-income-operating-system','ai-business-engine','ai-income-starter-kit','7-day-checklist','savings-blueprint')),
  page text CHECK (page IS NULL OR char_length(page) <= 200),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.download_events TO anon, authenticated;
GRANT SELECT ON public.download_events TO authenticated;
GRANT ALL ON public.download_events TO service_role;
ALTER TABLE public.download_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record a download" ON public.download_events FOR INSERT TO anon, authenticated WITH CHECK (created_at > now() - interval '1 minute');
CREATE POLICY "Admins read downloads" ON public.download_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX download_events_resource_idx ON public.download_events (resource, created_at DESC);