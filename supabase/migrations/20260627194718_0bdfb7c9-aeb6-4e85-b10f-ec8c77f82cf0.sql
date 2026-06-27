
CREATE TABLE public.newsletter_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.newsletter_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
GRANT SELECT ON public.newsletter_post_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.newsletter_post_likes TO authenticated;
GRANT ALL ON public.newsletter_post_likes TO service_role;
ALTER TABLE public.newsletter_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read likes" ON public.newsletter_post_likes FOR SELECT USING (true);
CREATE POLICY "Users like as themselves" ON public.newsletter_post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own like" ON public.newsletter_post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.newsletter_post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.newsletter_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.newsletter_post_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_post_comments TO authenticated;
GRANT ALL ON public.newsletter_post_comments TO service_role;
ALTER TABLE public.newsletter_post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read comments" ON public.newsletter_post_comments FOR SELECT USING (true);
CREATE POLICY "Users post comments as themselves" ON public.newsletter_post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Author or admin updates comment" ON public.newsletter_post_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Author or admin deletes comment" ON public.newsletter_post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_nl_comments_post ON public.newsletter_post_comments(post_id, created_at DESC);
CREATE INDEX idx_nl_likes_post ON public.newsletter_post_likes(post_id);

CREATE TRIGGER update_nl_comments_updated_at BEFORE UPDATE ON public.newsletter_post_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
