DROP POLICY IF EXISTS "Signed-in members read courses" ON public.courses;
CREATE POLICY "Anyone reads course catalog" ON public.courses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Signed-in members read module metadata" ON public.modules;
CREATE POLICY "Anyone reads module catalog" ON public.modules FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.courses, public.modules TO anon;