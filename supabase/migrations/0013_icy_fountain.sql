/*
  # Add Related Artists Support

  1. New Tables
    - `related_artists`
      - `release_id` (uuid, references releases)
      - `artist_name` (text)
      - `popularity` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `related_artists` table
    - Add policies for admin access
*/

-- Create related artists table
CREATE TABLE IF NOT EXISTS related_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid REFERENCES releases(id) ON DELETE CASCADE,
  artist_name text NOT NULL,
  popularity integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE related_artists ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Related artists are viewable by everyone"
  ON related_artists FOR SELECT
  USING (true);

CREATE POLICY "Only admin users can manage related artists"
  ON related_artists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );