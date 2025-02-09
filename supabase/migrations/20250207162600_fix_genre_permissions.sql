-- Drop existing RLS policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON genre_groups;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON genre_mappings;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON genres;

-- Enable RLS on all tables
ALTER TABLE genre_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

-- Create RLS policies that allow all authenticated users to read
CREATE POLICY "Enable read access for authenticated users"
ON genre_groups FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON genre_mappings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON genres FOR SELECT
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT SELECT ON genre_groups TO authenticated;
GRANT SELECT ON genre_mappings TO authenticated;
GRANT SELECT ON genres TO authenticated;
