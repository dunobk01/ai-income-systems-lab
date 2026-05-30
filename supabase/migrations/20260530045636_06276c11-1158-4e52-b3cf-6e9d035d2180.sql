
-- Helper: tier rank and check
CREATE OR REPLACE FUNCTION public.tier_rank(_tier subscription_tier)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE _tier
    WHEN 'none' THEN 0
    WHEN 'starter' THEN 1
    WHEN 'builder' THEN 2
    WHEN 'pro' THEN 3
    ELSE 0
  END
$$;

CREATE OR REPLACE FUNCTION public.user_has_tier(_user_id uuid, _required subscription_tier)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = _user_id
      AND public.tier_rank(p.tier) >= public.tier_rank(_required)
  )
$$;

-- MODULES: replace public read with tier-gated authenticated read
DROP POLICY IF EXISTS "Anyone reads modules" ON public.modules;

CREATE POLICY "Authenticated users read modules at their tier"
ON public.modules
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.user_has_tier(auth.uid(), required_tier)
);

-- LESSONS: gate on parent module's required_tier
DROP POLICY IF EXISTS "Anyone reads lessons" ON public.lessons;

CREATE POLICY "Authenticated users read lessons at their tier"
ON public.lessons
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.modules m
    WHERE m.id = lessons.module_id
      AND public.user_has_tier(auth.uid(), m.required_tier)
  )
);

-- PROMPTS: gate on row's required_tier
DROP POLICY IF EXISTS "Anyone reads prompts" ON public.prompts;

CREATE POLICY "Authenticated users read prompts at their tier"
ON public.prompts
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.user_has_tier(auth.uid(), required_tier)
);

-- Revoke anon SELECT (policies above only grant to authenticated)
REVOKE SELECT ON public.modules FROM anon;
REVOKE SELECT ON public.lessons FROM anon;
REVOKE SELECT ON public.prompts FROM anon;
