-- 1. profiles: prevent user_id swap
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND user_id = (SELECT p.user_id FROM public.profiles p WHERE p.user_id = auth.uid())
  AND tier = (SELECT p.tier FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 2. community_likes: tier-check on DELETE
DROP POLICY IF EXISTS "Owner can unlike" ON public.community_likes;
CREATE POLICY "Owner can unlike"
ON public.community_likes
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  AND (public.user_has_tier(auth.uid(), 'builder') OR public.has_role(auth.uid(), 'admin'))
);

-- 3. newsletter_post_comments: authenticated-only read
DROP POLICY IF EXISTS "Anyone can read comments" ON public.newsletter_post_comments;
CREATE POLICY "Authenticated can read comments"
ON public.newsletter_post_comments
FOR SELECT
TO authenticated
USING (true);

-- 4. newsletter_post_likes: authenticated-only read
DROP POLICY IF EXISTS "Anyone can read likes" ON public.newsletter_post_likes;
CREATE POLICY "Authenticated can read likes"
ON public.newsletter_post_likes
FOR SELECT
TO authenticated
USING (true);