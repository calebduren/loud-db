/*
  # Fix tracks and track credits tables

  1. Changes
    - Create track_credits table
    - Add proper indexes
    - Update RLS policies

  2. Security
    - Enable RLS on track_credits table
    - Add policies for admin and creator access
*/

-- Create track_credits table
CREATE TABLE IF NOT EXISTS track_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_track_credits_track_id ON track_credits(track_id);

-- Enable RLS
ALTER TABLE track_credits ENABLE ROW LEVEL SECURITY;

-- Add policies for track_credits
CREATE POLICY "Track credits are viewable by everyone"
  ON track_credits FOR SELECT
  USING (true);

CREATE POLICY "Admin and creator users can manage track credits"
  ON track_credits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'creator')
    )
  );

-- Drop credits column from tracks if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracks' AND column_name = 'credits'
  ) THEN
    ALTER TABLE tracks DROP COLUMN credits;
  END IF;
END $$;