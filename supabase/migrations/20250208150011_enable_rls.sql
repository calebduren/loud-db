-- First, enable RLS on all tables
ALTER TABLE IF EXISTS releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS release_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS genre_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS genre_mappings ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON releases;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON release_artists;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON artists;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON genres;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON genre_groups;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON genre_mappings;

-- Create simple policies that allow authenticated users to read
CREATE POLICY "Enable read access for authenticated users" ON releases
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON release_artists
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON artists
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON genres
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON genre_groups
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON genre_mappings
    FOR SELECT TO authenticated USING (true);

-- Grant SELECT permissions
GRANT SELECT ON releases TO authenticated;
GRANT SELECT ON release_artists TO authenticated;
GRANT SELECT ON artists TO authenticated;
GRANT SELECT ON genres TO authenticated;
GRANT SELECT ON genre_groups TO authenticated;
GRANT SELECT ON genre_mappings TO authenticated;
