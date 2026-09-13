select cron.schedule(
  'os-day5-followup',
  '0 16 * * *',
  $$
  select net.http_post(
    url := 'https://ai-income-systems.com/api/public/email/os-day5',
    headers := '{"Content-Type":"application/json","x-cron-secret":"os_seq_7Qf3xR2mvB9tLpKd4NwZaHu6YsE1CgJi"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);