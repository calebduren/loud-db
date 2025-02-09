-- Add RLS policies for genre tables
GRANT SELECT ON genre_groups TO authenticated;
GRANT SELECT ON genre_mappings TO authenticated;

-- Enable RLS on genre_groups and genre_mappings
ALTER TABLE genre_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre_mappings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON genre_groups;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON genre_mappings;

-- Add policies to allow authenticated users to read
CREATE POLICY "Enable read access for authenticated users"
ON genre_groups FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON genre_mappings FOR SELECT
TO authenticated
USING (true);
