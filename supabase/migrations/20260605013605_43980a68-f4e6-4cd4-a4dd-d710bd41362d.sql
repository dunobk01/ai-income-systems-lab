CREATE TABLE IF NOT EXISTS public._lesson_content_staging (
  id uuid PRIMARY KEY,
  content text NOT NULL,
  action_steps text NOT NULL
);
GRANT ALL ON public._lesson_content_staging TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public._lesson_content_staging TO authenticated;
ALTER TABLE public._lesson_content_staging ENABLE ROW LEVEL SECURITY;