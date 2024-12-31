-- Create reserved usernames table
CREATE TABLE reserved_usernames (
  username text PRIMARY KEY,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reserved_usernames ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Reserved usernames are viewable by everyone"
  ON reserved_usernames FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage reserved usernames"
  ON reserved_usernames FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Update username availability check function
CREATE OR REPLACE FUNCTION check_username_available(username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if username is reserved
  IF EXISTS (
    SELECT 1 FROM reserved_usernames
    WHERE reserved_usernames.username = LOWER(check_username_available.username)
  ) THEN
    RETURN false;
  END IF;

  -- Check if username is taken by another user
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE LOWER(profiles.username) = LOWER(check_username_available.username)
  );
END;
$$;

-- Insert some common reserved usernames
INSERT INTO reserved_usernames (username, reason) VALUES
  ('admin', 'System reserved'),
  ('administrator', 'System reserved'),
  ('system', 'System reserved'),
  ('mod', 'System reserved'),
  ('moderator', 'System reserved'),
  ('support', 'System reserved'),
  ('help', 'System reserved'),
  ('info', 'System reserved'),
  ('root', 'System reserved'),
  ('api', 'System reserved'),
  ('test', 'System reserved'),
  ('demo', 'System reserved'),
  ('null', 'System reserved'),
  ('undefined', 'System reserved');