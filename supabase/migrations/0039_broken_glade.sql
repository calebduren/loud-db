-- Update release_artists policies to allow creators to manage relationships
DROP POLICY IF EXISTS "Only admin users can manage release artists" ON release_artists;

CREATE POLICY "Admin and creator users can manage release artists"
  ON release_artists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'creator')
    )
  );

-- Update artists policies to allow creators to manage artists
DROP POLICY IF EXISTS "Only admin users can manage artists" ON artists;

CREATE POLICY "Admin and creator users can manage artists"
  ON artists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'creator')
    )
  );