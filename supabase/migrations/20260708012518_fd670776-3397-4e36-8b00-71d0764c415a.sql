
ALTER TABLE public.newsletter_posts
  ADD COLUMN IF NOT EXISTS post_type text NOT NULL DEFAULT 'blog';

ALTER TABLE public.newsletter_posts
  DROP CONSTRAINT IF EXISTS newsletter_posts_post_type_check;
ALTER TABLE public.newsletter_posts
  ADD CONSTRAINT newsletter_posts_post_type_check CHECK (post_type IN ('blog','newsletter'));

CREATE INDEX IF NOT EXISTS newsletter_posts_post_type_idx ON public.newsletter_posts(post_type);

-- Mark the two original weekly issues as newsletter; everything else stays as blog.
UPDATE public.newsletter_posts
  SET post_type = 'newsletter'
  WHERE slug IN (
    'ai-tool-stack-nobody-tells-you-about',
    'the-part-of-ai-income-nobody-maps-out'
  );
