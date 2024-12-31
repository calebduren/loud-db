-- Create invite codes table
CREATE TABLE invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_by uuid REFERENCES profiles(id),
  used_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  used_at timestamptz,
  expires_at timestamptz
);

-- Enable RLS
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Invite codes are viewable by admins"
  ON invite_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can create invite codes"
  ON invite_codes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to validate invite code
CREATE OR REPLACE FUNCTION validate_invite_code(code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM invite_codes
    WHERE invite_codes.code = validate_invite_code.code
    AND used_by IS NULL
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

-- Function to use invite code
CREATE OR REPLACE FUNCTION use_invite_code(code text, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE invite_codes
  SET used_by = user_id,
      used_at = now()
  WHERE invite_codes.code = use_invite_code.code
  AND used_by IS NULL
  AND (expires_at IS NULL OR expires_at > now());
  
  RETURN FOUND;
END;
$$;