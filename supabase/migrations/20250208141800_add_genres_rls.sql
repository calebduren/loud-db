-- Enable RLS on all tables if not already enabled
DO $$ 
BEGIN
  -- Enable RLS on releases table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'releases' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on genres table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'genres' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on genre_groups table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'genre_groups' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE genre_groups ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on genre_mappings table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'genre_mappings' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE genre_mappings ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies
DO $$ 
BEGIN
  -- Drop releases policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'releases' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    DROP POLICY "Enable read access for authenticated users" ON releases;
  END IF;

  -- Drop genres policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'genres' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    DROP POLICY "Enable read access for authenticated users" ON genres;
  END IF;

  -- Drop genre_groups policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'genre_groups' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    DROP POLICY "Enable read access for authenticated users" ON genre_groups;
  END IF;

  -- Drop genre_mappings policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'genre_mappings' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    DROP POLICY "Enable read access for authenticated users" ON genre_mappings;
  END IF;
END $$;

-- Create new policies
-- Allow authenticated users to read all releases
CREATE POLICY "Enable read access for authenticated users"
ON releases FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to read all genres
CREATE POLICY "Enable read access for authenticated users"
ON genres FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to read all genre groups
CREATE POLICY "Enable read access for authenticated users"
ON genre_groups FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to read all genre mappings
CREATE POLICY "Enable read access for authenticated users"
ON genre_mappings FOR SELECT
TO authenticated
USING (true);

-- Grant necessary permissions
DO $$ 
BEGIN
  -- Grant permissions on releases
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE grantee = 'authenticated' 
    AND table_name = 'releases' 
    AND privilege_type = 'SELECT'
  ) THEN
    GRANT SELECT ON releases TO authenticated;
  END IF;

  -- Grant permissions on genres
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE grantee = 'authenticated' 
    AND table_name = 'genres' 
    AND privilege_type = 'SELECT'
  ) THEN
    GRANT SELECT ON genres TO authenticated;
  END IF;

  -- Grant permissions on genre_groups
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE grantee = 'authenticated' 
    AND table_name = 'genre_groups' 
    AND privilege_type = 'SELECT'
  ) THEN
    GRANT SELECT ON genre_groups TO authenticated;
  END IF;

  -- Grant permissions on genre_mappings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE grantee = 'authenticated' 
    AND table_name = 'genre_mappings' 
    AND privilege_type = 'SELECT'
  ) THEN
    GRANT SELECT ON genre_mappings TO authenticated;
  END IF;
END $$;
