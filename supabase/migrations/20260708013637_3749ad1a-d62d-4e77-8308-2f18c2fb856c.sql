CREATE TABLE public.wins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  system TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wins TO authenticated;
GRANT ALL ON public.wins TO service_role;

ALTER TABLE public.wins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated members can view all wins"
  ON public.wins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can post their own wins"
  ON public.wins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wins"
  ON public.wins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wins; admins can delete any"
  ON public.wins FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_wins_updated_at
  BEFORE UPDATE ON public.wins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_wins_created_at ON public.wins (created_at DESC);