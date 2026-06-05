
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile-tier topic" ON realtime.messages;
CREATE POLICY "Users read own profile-tier topic"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'profile-tier-' || auth.uid()::text
);
