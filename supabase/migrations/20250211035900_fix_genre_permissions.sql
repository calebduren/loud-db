-- Description: Add missing RLS policies for genres table to allow authenticated users to create and read genres
-- Migration to fix genre permissions

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.genres;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.genres;

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.genres TO authenticated;

-- Add policy to allow authenticated users to read genres
CREATE POLICY "Enable read access for authenticated users"
ON public.genres FOR SELECT
TO authenticated
USING (true);

-- Add policy to allow authenticated users to create genres
CREATE POLICY "Enable insert access for authenticated users"
ON public.genres FOR INSERT
TO authenticated
WITH CHECK (true);

-- Grant permissions for release_genres junction table
GRANT SELECT, INSERT ON public.release_genres TO authenticated;

-- Add policies for release_genres
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.release_genres;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.release_genres;

CREATE POLICY "Enable read access for authenticated users"
ON public.release_genres FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON public.release_genres FOR INSERT
TO authenticated
WITH CHECK (true);
