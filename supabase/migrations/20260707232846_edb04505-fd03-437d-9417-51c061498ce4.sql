
-- 1) Extend newsletter_posts with tags + pillar link
ALTER TABLE public.newsletter_posts
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pillar_slug text;

CREATE INDEX IF NOT EXISTS idx_newsletter_posts_tags ON public.newsletter_posts USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_newsletter_posts_pillar_slug ON public.newsletter_posts (pillar_slug);

-- 2) Pillar hub pages
CREATE TABLE IF NOT EXISTS public.blog_pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  intro text,
  cover_image_url text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_pillars TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_pillars TO authenticated;
GRANT ALL ON public.blog_pillars TO service_role;

ALTER TABLE public.blog_pillars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published pillars"
  ON public.blog_pillars
  FOR SELECT
  TO anon, authenticated
  USING (published_at IS NOT NULL AND published_at <= now());

CREATE POLICY "Admins can read all pillars"
  ON public.blog_pillars
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert pillars"
  ON public.blog_pillars
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pillars"
  ON public.blog_pillars
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pillars"
  ON public.blog_pillars
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER blog_pillars_set_updated_at
  BEFORE UPDATE ON public.blog_pillars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
