ALTER TABLE public.tool_leads
  ADD COLUMN IF NOT EXISTS report_json jsonb,
  ADD COLUMN IF NOT EXISTS report_token text,
  ADD COLUMN IF NOT EXISTS mailerlite_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS mailerlite_error text;

CREATE UNIQUE INDEX IF NOT EXISTS tool_leads_report_token_key
  ON public.tool_leads (report_token)
  WHERE report_token IS NOT NULL;

-- Token-only public read. Returns at most one row and never exposes the email
-- address, so reports cannot be listed or enumerated.
CREATE OR REPLACE FUNCTION public.get_tool_report(_token text)
RETURNS TABLE (
  tool_slug text,
  first_name text,
  business_type text,
  score integer,
  result_summary text,
  report_json jsonb,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT l.tool_slug, l.first_name, l.business_type, l.score,
         l.result_summary, l.report_json, l.created_at
  FROM public.tool_leads l
  WHERE l.report_token = _token
    AND l.report_json IS NOT NULL
    AND length(coalesce(_token, '')) >= 16
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_tool_report(text) TO anon, authenticated, service_role;