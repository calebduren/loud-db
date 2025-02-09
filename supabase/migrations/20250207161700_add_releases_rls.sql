-- Enable RLS on releases table
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

-- Add policy to allow authenticated users to read all releases
CREATE POLICY "Enable read access for authenticated users"
ON releases FOR SELECT
TO authenticated
USING (true);
