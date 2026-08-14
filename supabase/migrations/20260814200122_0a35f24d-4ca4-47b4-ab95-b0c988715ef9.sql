-- 1) Lesson-level free samples
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_preview boolean NOT NULL DEFAULT false;

-- Module 1 stays fully free; module 2 becomes paid with 2 free sample lessons
UPDATE public.modules SET is_preview = false WHERE slug = 'master-chatgpt';
UPDATE public.modules SET is_preview = true WHERE slug = 'ai-money-foundations';

UPDATE public.lessons l SET is_preview = true
WHERE l.module_id = (SELECT id FROM public.modules WHERE slug = 'master-chatgpt')
  AND l.order_index <= 2;

-- 2) Lesson content policy also honours lesson-level samples
DROP POLICY IF EXISTS "Authenticated users read lessons at their tier" ON public.lessons;
CREATE POLICY "Authenticated users read lessons at their tier"
ON public.lessons FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR lessons.is_preview = true
  OR EXISTS (
    SELECT 1 FROM public.modules m
    WHERE m.id = lessons.module_id
      AND (m.is_preview = true OR public.user_has_tier(auth.uid(), m.required_tier))
  )
);

-- 3) Module metadata is a showroom: visible to everyone signed in
DROP POLICY IF EXISTS "Authenticated users read modules at their tier" ON public.modules;
CREATE POLICY "Anyone can read module metadata"
ON public.modules FOR SELECT
USING (true);

-- 4) Safe catalogues (no gated body text) so locked items stay visible
CREATE OR REPLACE FUNCTION public.lesson_catalog()
RETURNS TABLE (
  id uuid, module_id uuid, slug text, title text,
  order_index integer, duration_minutes integer, is_preview boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT l.id, l.module_id, l.slug, l.title, l.order_index, l.duration_minutes, l.is_preview
  FROM public.lessons l
  ORDER BY l.order_index
$$;

CREATE OR REPLACE FUNCTION public.prompt_catalog()
RETURNS TABLE (
  id uuid, title text, category text, tool text,
  use_case text, required_tier subscription_tier, is_preview boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.title, p.category, p.tool, p.use_case, p.required_tier, p.is_preview
  FROM public.prompts p
  ORDER BY p.category, p.title
$$;

REVOKE ALL ON FUNCTION public.lesson_catalog() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.prompt_catalog() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lesson_catalog() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.prompt_catalog() TO authenticated, service_role;