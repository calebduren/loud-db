ALTER TABLE genre_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to genre_groups"
ON genre_groups
FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Allow public read access to genre_mappings"
ON genre_mappings
FOR SELECT
TO PUBLIC
USING (true);
