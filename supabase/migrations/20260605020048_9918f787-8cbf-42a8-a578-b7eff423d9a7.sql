
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS is_preview boolean NOT NULL DEFAULT false;
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS is_preview boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Authenticated users read modules at their tier" ON public.modules;
CREATE POLICY "Authenticated users read modules at their tier"
  ON public.modules FOR SELECT
  USING (
    is_preview = true
    OR has_role(auth.uid(), 'admin'::app_role)
    OR user_has_tier(auth.uid(), required_tier)
  );

DROP POLICY IF EXISTS "Authenticated users read lessons at their tier" ON public.lessons;
CREATE POLICY "Authenticated users read lessons at their tier"
  ON public.lessons FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.modules m
      WHERE m.id = lessons.module_id
        AND (m.is_preview = true OR user_has_tier(auth.uid(), m.required_tier))
    )
  );

DROP POLICY IF EXISTS "Authenticated users read prompts at their tier" ON public.prompts;
CREATE POLICY "Authenticated users read prompts at their tier"
  ON public.prompts FOR SELECT
  USING (
    is_preview = true
    OR has_role(auth.uid(), 'admin'::app_role)
    OR user_has_tier(auth.uid(), required_tier)
  );

UPDATE public.modules SET is_preview = true WHERE order_index IN (1, 2);
UPDATE public.prompts SET is_preview = true
  WHERE title IN ('RCTF Prompt Template', '10 Hook Generator', 'Niche Researcher', 'Brand Voice Profile', 'Customer Voice Extractor');
