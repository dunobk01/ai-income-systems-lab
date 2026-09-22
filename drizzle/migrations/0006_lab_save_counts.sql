CREATE OR REPLACE FUNCTION public.lab_save_counts()
RETURNS TABLE (post_id uuid, save_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.post_id, count(*)::bigint
  FROM public.newsletter_post_saves s
  JOIN public.newsletter_posts p ON p.id = s.post_id AND p.post_type = 'lab'
  GROUP BY s.post_id;
$$;

GRANT EXECUTE ON FUNCTION public.lab_save_counts() TO anon, authenticated, service_role;