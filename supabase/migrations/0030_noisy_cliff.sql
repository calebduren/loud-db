/*
  # Add tracks and credits support
  
  1. New Tables
    - `tracks`
      - `id` (uuid, primary key)
      - `release_id` (uuid, references releases)
      - `name` (text)
      - `duration_ms` (integer)
      - `track_number` (integer)
      - `preview_url` (text)
      - `created_at` (timestamptz)
    
    - `credits`
      - `id` (uuid, primary key) 
      - `track_id` (uuid, references tracks)
      - `name` (text)
      - `role` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for admin write access
*/

-- Create tracks table
CREATE TABLE tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid REFERENCES releases(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration_ms integer,
  track_number integer NOT NULL,
  preview_url text,
  created_at timestamptz DEFAULT now()
);

-- Create credits table
CREATE TABLE credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

-- Add policies for tracks
CREATE POLICY "Tracks are viewable by everyone"
  ON tracks FOR SELECT
  USING (true);

CREATE POLICY "Only admin users can manage tracks"
  ON tracks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add policies for credits
CREATE POLICY "Credits are viewable by everyone"
  ON credits FOR SELECT
  USING (true);

CREATE POLICY "Only admin users can manage credits"
  ON credits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add indexes
CREATE INDEX idx_tracks_release_id ON tracks(release_id);
CREATE INDEX idx_credits_track_id ON credits(track_id);