CREATE TABLE public.os_sequence_sends (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  step text not null,
  sent_at timestamptz not null default now(),
  unique (email, step)
);
GRANT ALL ON public.os_sequence_sends TO service_role;
ALTER TABLE public.os_sequence_sends ENABLE ROW LEVEL SECURITY;