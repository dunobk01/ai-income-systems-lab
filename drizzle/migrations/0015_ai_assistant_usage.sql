CREATE TABLE public.ai_chat_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_chat_usage_user ON public.ai_chat_usage (user_id, created_at);
GRANT SELECT, INSERT ON public.ai_chat_usage TO authenticated;
GRANT ALL ON public.ai_chat_usage TO service_role;
ALTER TABLE public.ai_chat_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own usage select" ON public.ai_chat_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own usage insert" ON public.ai_chat_usage FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);