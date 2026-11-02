CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','open','replied','closed')),
  thread_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24),'hex'),
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.contact_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
  author text NOT NULL CHECK (author IN ('visitor','admin')),
  body text NOT NULL,
  email_status text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_entries_message_idx ON public.contact_entries(message_id, created_at);
CREATE INDEX IF NOT EXISTS contact_messages_ip_idx ON public.contact_messages(ip_hash, created_at);
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_entries TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
GRANT ALL ON public.contact_entries TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage contact messages" ON public.contact_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage contact entries" ON public.contact_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));