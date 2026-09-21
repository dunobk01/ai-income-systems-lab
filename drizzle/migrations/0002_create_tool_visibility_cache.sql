CREATE TABLE public.tool_visibility_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX idx_tool_visibility_cache_expires ON public.tool_visibility_cache (expires_at);

GRANT ALL ON public.tool_visibility_cache TO service_role;

ALTER TABLE public.tool_visibility_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages visibility cache"
  ON public.tool_visibility_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);