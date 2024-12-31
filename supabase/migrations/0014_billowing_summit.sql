-- Update role type check to include creator role
ALTER TABLE profiles 
DROP CONSTRAINT profiles_role_check,
ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'admin', 'creator'));

-- Update release policies to allow creators to manage releases
DROP POLICY IF EXISTS "Only admin users can insert releases" ON releases;
DROP POLICY IF EXISTS "Only admin users can update releases" ON releases;
DROP POLICY IF EXISTS "Only admin users can delete releases" ON releases;

CREATE POLICY "Admin and creator users can insert releases"
  ON releases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'creator')
    )
  );

CREATE POLICY "Admin and creator users can update releases"
  ON releases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'creator')
    )
  );

CREATE POLICY "Admin and creator users can delete releases"
  ON releases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'creator')
    )
  );

-- Update storage policies for cover images
DROP POLICY IF EXISTS "Only admin users can upload cover images" ON storage.objects;
DROP POLICY IF EXISTS "Only admin users can update cover images" ON storage.objects;
DROP POLICY IF EXISTS "Only admin users can delete cover images" ON storage.objects;

CREATE POLICY "Admin and creator users can upload cover images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'covers' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'creator')
  )
);

CREATE POLICY "Admin and creator users can update cover images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'covers'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'creator')
  )
);

CREATE POLICY "Admin and creator users can delete cover images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'covers'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'creator')
  )
);

-- Function to make a user a creator
CREATE OR REPLACE FUNCTION make_user_creator(user_email text)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET role = 'creator'
  WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;