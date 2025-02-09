-- Enable RLS on artists table if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'artists' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Enable RLS on release_artists table if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'release_artists' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE release_artists ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop artists policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'artists' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    DROP POLICY "Enable read access for authenticated users" ON artists;
  END IF;

  -- Drop release_artists policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'release_artists' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    DROP POLICY "Enable read access for authenticated users" ON release_artists;
  END IF;

  -- Drop join policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'release_artists' 
    AND policyname = 'Enable join access for authenticated users'
  ) THEN
    DROP POLICY "Enable join access for authenticated users" ON release_artists;
  END IF;
END $$;

-- Add policies for artists table
CREATE POLICY "Enable read access for authenticated users"
ON artists FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM release_artists ra
  WHERE ra.artist_id = artists.id
));

-- Add policies for release_artists table
CREATE POLICY "Enable read access for authenticated users"
ON release_artists FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM releases r
  WHERE r.id = release_artists.release_id
));

-- Grant permissions to authenticated users if not already granted
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE grantee = 'authenticated' 
    AND table_name = 'artists' 
    AND privilege_type = 'SELECT'
  ) THEN
    GRANT SELECT ON artists TO authenticated;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE grantee = 'authenticated' 
    AND table_name = 'release_artists' 
    AND privilege_type = 'SELECT'
  ) THEN
    GRANT SELECT ON release_artists TO authenticated;
  END IF;
END $$;
