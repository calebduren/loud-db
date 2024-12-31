/*
  # Update tracks table and policies

  1. Changes
    - Add missing indexes
    - Update RLS policies
    - Drop unused track_credits table

  2. Security
    - Enable RLS on tracks table
    - Add policies for admin and creator access
*/

-- Drop unused track_credits table
DROP TABLE IF EXISTS track_credits CASCADE;

-- Add missing index for release_id if not exists
CREATE INDEX IF NOT EXISTS idx_tracks_release_id ON tracks(release_id);

-- Enable RLS if not already enabled
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Only admin users can manage tracks" ON tracks;
DROP POLICY IF EXISTS "Admin and creator users can manage tracks" ON tracks;
DROP POLICY IF EXISTS "Tracks are viewable by everyone" ON tracks;

CREATE POLICY "Admin and creator users can manage tracks"
  ON tracks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'creator')
    )
  );

CREATE POLICY "Tracks are viewable by everyone"
  ON tracks FOR SELECT
  USING (true);