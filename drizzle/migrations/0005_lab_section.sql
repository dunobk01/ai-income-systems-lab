-- Allow 'lab' as a post_type
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.newsletter_posts'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%post_type%'
  LOOP
    EXECUTE format('ALTER TABLE public.newsletter_posts DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.newsletter_posts
  ADD CONSTRAINT newsletter_posts_post_type_check
  CHECK (post_type IN ('newsletter','blog','lab'));

ALTER TABLE public.newsletter_posts
  ADD COLUMN IF NOT EXISTS pain_point text,
  ADD COLUMN IF NOT EXISTS audience text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS problem_solved text,
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS time_to_implement text,
  ADD COLUMN IF NOT EXISTS tools_used text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS share_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reading_minutes integer;

ALTER TABLE public.newsletter_posts
  ADD CONSTRAINT newsletter_posts_difficulty_check
  CHECK (difficulty IS NULL OR difficulty IN ('beginner','intermediate','advanced'));

CREATE INDEX IF NOT EXISTS newsletter_posts_type_published_idx
  ON public.newsletter_posts (post_type, published_at DESC);

CREATE TABLE IF NOT EXISTS public.newsletter_post_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.newsletter_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.newsletter_post_saves TO authenticated;
GRANT ALL ON public.newsletter_post_saves TO service_role;

ALTER TABLE public.newsletter_post_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own saves" ON public.newsletter_post_saves
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own saves" ON public.newsletter_post_saves
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own saves" ON public.newsletter_post_saves
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Public, rate-limit-free share counter (no auth needed, increments only)
CREATE OR REPLACE FUNCTION public.increment_lab_share(_post_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.newsletter_posts
     SET share_count = COALESCE(share_count, 0) + 1
   WHERE id = _post_id AND post_type = 'lab'
  RETURNING share_count;
$$;

GRANT EXECUTE ON FUNCTION public.increment_lab_share(uuid) TO anon, authenticated, service_role;