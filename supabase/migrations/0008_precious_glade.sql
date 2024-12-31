/*
  # Add support for multiple artists per release

  1. Changes
    - Create new `artists` table to store artist information
    - Create `release_artists` junction table for many-to-many relationship
    - Modify `releases` table to remove single artist column
    - Migrate existing artist data to new structure

  2. Security
    - Enable RLS on new tables
    - Add appropriate policies for viewing and managing artists
*/

-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create junction table for releases and artists
CREATE TABLE IF NOT EXISTS release_artists (
  release_id uuid REFERENCES releases(id) ON DELETE CASCADE,
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (release_id, artist_id)
);

-- Enable RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_artists ENABLE ROW LEVEL SECURITY;

-- Add policies for artists
CREATE POLICY "Artists are viewable by everyone"
  ON artists FOR SELECT
  USING (true);

CREATE POLICY "Only admin users can manage artists"
  ON artists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add policies for release_artists
CREATE POLICY "Release artists are viewable by everyone"
  ON release_artists FOR SELECT
  USING (true);

CREATE POLICY "Only admin users can manage release artists"
  ON release_artists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Migrate existing data
DO $$ 
BEGIN
  -- Insert existing artists
  INSERT INTO artists (name)
  SELECT DISTINCT artist FROM releases;

  -- Create relationships
  INSERT INTO release_artists (release_id, artist_id, position)
  SELECT r.id, a.id, 0
  FROM releases r
  JOIN artists a ON a.name = r.artist;
END $$;

-- Remove artist column from releases
ALTER TABLE releases DROP COLUMN artist;