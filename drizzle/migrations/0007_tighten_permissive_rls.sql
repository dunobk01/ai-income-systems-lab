DROP POLICY IF EXISTS "Anyone reads courses" ON public.courses;
CREATE POLICY "Signed-in members read courses" ON public.courses FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can read module metadata" ON public.modules;
CREATE POLICY "Signed-in members read module metadata" ON public.modules FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated can read comments" ON public.newsletter_post_comments;
CREATE POLICY "Read comments on published posts" ON public.newsletter_post_comments FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.newsletter_posts p WHERE p.id = post_id AND p.published_at IS NOT NULL AND p.published_at <= now()));

DROP POLICY IF EXISTS "Authenticated can read likes" ON public.newsletter_post_likes;
CREATE POLICY "Read likes on published posts" ON public.newsletter_post_likes FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.newsletter_posts p WHERE p.id = post_id AND p.published_at IS NOT NULL AND p.published_at <= now()));

DROP POLICY IF EXISTS "Anyone can submit a tool lead" ON public.tool_leads;
CREATE POLICY "Anyone can submit a valid tool lead" ON public.tool_leads FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(email) BETWEEN 3 AND 320
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND tool_slug IN ('ai-readiness-scorecard','ai-savings-calculator','ai-visibility-check','ai-prompt-generator')
  AND (first_name IS NULL OR char_length(first_name) <= 100)
  AND (business_type IS NULL OR char_length(business_type) <= 120)
  AND jsonb_typeof(answers) IN ('object','array')
  AND (score IS NULL OR score BETWEEN 0 AND 100)
  AND report_token IS NULL AND report_json IS NULL
  AND mailerlite_synced_at IS NULL AND mailerlite_error IS NULL
);