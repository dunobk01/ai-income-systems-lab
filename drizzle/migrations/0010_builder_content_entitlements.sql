CREATE OR REPLACE FUNCTION public.has_builder_content_access()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
 SELECT auth.uid() IS NOT NULL AND (
   public.has_role(auth.uid(), 'admin'::public.app_role)
   OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND tier::text IN ('builder', 'pro', 'accelerator'))
 );
$$;
REVOKE ALL ON FUNCTION public.has_builder_content_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_builder_content_access() TO anon, authenticated, service_role;
ALTER POLICY "Anyone can read published posts" ON public.newsletter_posts USING (
 published_at IS NOT NULL AND published_at <= now()
 AND (post_type IS DISTINCT FROM 'lab' OR public.has_builder_content_access())
);
ALTER POLICY "Anyone can read published pillars" ON public.blog_pillars USING (
 published_at IS NOT NULL AND published_at <= now() AND public.has_builder_content_access()
);
CREATE OR REPLACE FUNCTION public.get_tool_report(_token text)
RETURNS TABLE(tool_slug text, first_name text, business_type text, score integer, result_summary text, report_json jsonb, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
 SELECT l.tool_slug, l.first_name, l.business_type, l.score, l.result_summary, l.report_json, l.created_at
 FROM public.tool_leads l
 WHERE l.report_token = _token AND l.report_json IS NOT NULL
 AND length(coalesce(_token, '')) >= 16 AND public.has_builder_content_access()
 LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.get_tool_report(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_tool_report(text) TO authenticated, service_role;