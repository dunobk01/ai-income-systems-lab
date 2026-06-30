
-- Community threads
CREATE TABLE public.community_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) BETWEEN 3 AND 200),
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 8000),
  category text NOT NULL DEFAULT 'general',
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_activity_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_threads TO authenticated;
GRANT ALL ON public.community_threads TO service_role;
ALTER TABLE public.community_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builder+ can read threads"
  ON public.community_threads FOR SELECT TO authenticated
  USING (public.user_has_tier(auth.uid(), 'builder') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Builder+ can create threads"
  ON public.community_threads FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (public.user_has_tier(auth.uid(), 'builder') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Owner or admin can update threads"
  ON public.community_threads FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner or admin can delete threads"
  ON public.community_threads FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX community_threads_last_activity_idx
  ON public.community_threads (pinned DESC, last_activity_at DESC);

CREATE TRIGGER community_threads_set_updated_at
  BEFORE UPDATE ON public.community_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Replies
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.community_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 8000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builder+ can read posts"
  ON public.community_posts FOR SELECT TO authenticated
  USING (public.user_has_tier(auth.uid(), 'builder') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Builder+ can create posts"
  ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (public.user_has_tier(auth.uid(), 'builder') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Owner or admin can update posts"
  ON public.community_posts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner or admin can delete posts"
  ON public.community_posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX community_posts_thread_idx
  ON public.community_posts (thread_id, created_at);

-- Bump last_activity_at on the parent thread whenever a reply lands
CREATE OR REPLACE FUNCTION public.bump_thread_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.community_threads
    SET last_activity_at = now()
    WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER community_posts_bump_activity
  AFTER INSERT ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.bump_thread_activity();

-- Likes (one per user per target; target is exactly one of thread or post)
CREATE TABLE public.community_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id uuid REFERENCES public.community_threads(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((thread_id IS NOT NULL)::int + (post_id IS NOT NULL)::int = 1),
  UNIQUE (user_id, thread_id),
  UNIQUE (user_id, post_id)
);
GRANT SELECT, INSERT, DELETE ON public.community_likes TO authenticated;
GRANT ALL ON public.community_likes TO service_role;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builder+ can read likes"
  ON public.community_likes FOR SELECT TO authenticated
  USING (public.user_has_tier(auth.uid(), 'builder') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Builder+ can like"
  ON public.community_likes FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (public.user_has_tier(auth.uid(), 'builder') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Owner can unlike"
  ON public.community_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
