/*
  # Update tracks schema

  1. Changes
    - Add credits column to tracks table
    - Update RLS policies
*/

-- Drop track_credits table if it exists
DROP TABLE IF EXISTS track_credits;

-- Add credits column to tracks table
ALTER TABLE tracks
ADD COLUMN credits jsonb[] DEFAULT '{}';

-- Update RLS policies for tracks
DROP POLICY IF EXISTS "Only admin users can manage tracks" ON tracks;

CREATE POLICY "Admin and creator users can manage tracks"
  ON tracks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'creator')
    )
  );