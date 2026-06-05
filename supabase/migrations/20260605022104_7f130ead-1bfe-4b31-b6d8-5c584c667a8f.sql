
CREATE TABLE public.agent_specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_specs TO authenticated;
GRANT ALL ON public.agent_specs TO service_role;
ALTER TABLE public.agent_specs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agent specs" ON public.agent_specs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_agent_specs_updated_at BEFORE UPDATE ON public.agent_specs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
