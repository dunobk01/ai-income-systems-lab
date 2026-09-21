CREATE TABLE public.tool_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  first_name text,
  tool_slug text NOT NULL,
  business_type text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer,
  result_summary text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

CREATE INDEX tool_leads_tool_slug_idx ON public.tool_leads (tool_slug, created_at DESC);
CREATE INDEX tool_leads_email_idx ON public.tool_leads (email);

GRANT INSERT ON public.tool_leads TO anon, authenticated;
GRANT SELECT ON public.tool_leads TO authenticated;
GRANT ALL ON public.tool_leads TO service_role;

ALTER TABLE public.tool_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a tool lead"
  ON public.tool_leads FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read tool leads"
  ON public.tool_leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- IP-based rate limiting for AI generations on the free tools.
CREATE TABLE public.tool_ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text NOT NULL,
  tool_slug text NOT NULL
);

CREATE INDEX tool_ai_usage_ip_idx ON public.tool_ai_usage (ip_hash, created_at DESC);

GRANT ALL ON public.tool_ai_usage TO service_role;
ALTER TABLE public.tool_ai_usage ENABLE ROW LEVEL SECURITY;
-- No policies: service-role only (server functions).