CREATE TABLE public.ai_chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New chat',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_chat_threads_user ON public.ai_chat_threads (user_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_chat_threads TO authenticated;
GRANT ALL ON public.ai_chat_threads TO service_role;
ALTER TABLE public.ai_chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own threads select" ON public.ai_chat_threads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own threads insert" ON public.ai_chat_threads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own threads update" ON public.ai_chat_threads FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own threads delete" ON public.ai_chat_threads FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.ai_chat_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  sdk_id text,
  message jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_chat_messages_thread ON public.ai_chat_messages (thread_id, created_at);
CREATE INDEX idx_ai_chat_messages_user_day ON public.ai_chat_messages (user_id, role, created_at);
GRANT SELECT, INSERT, DELETE ON public.ai_chat_messages TO authenticated;
GRANT ALL ON public.ai_chat_messages TO service_role;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own messages select" ON public.ai_chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own messages insert" ON public.ai_chat_messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.ai_chat_threads t WHERE t.id = thread_id AND t.user_id = auth.uid())
);
CREATE POLICY "Own messages delete" ON public.ai_chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);