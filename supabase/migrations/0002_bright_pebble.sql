/*
  # Add Releases Management

  1. New Tables
    - `releases`
      - Music release information
      - Managed by admin users
    
  2. Security
    - Enable RLS
    - Only admin users can create/edit releases
    - Everyone can view releases
*/

-- Create releases table
CREATE TABLE releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  artist text NOT NULL,
  release_type text NOT NULL CHECK (release_type IN ('single', 'EP', 'LP', 'compilation')),
  cover_url text,
  genres text[] NOT NULL DEFAULT '{}',
  record_label text,
  track_count integer NOT NULL,
  spotify_url text,
  apple_music_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

-- Policies for releases
CREATE POLICY "Releases are viewable by everyone"
  ON releases FOR SELECT
  USING (true);

CREATE POLICY "Only admin users can insert releases"
  ON releases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

CREATE POLICY "Only admin users can update releases"
  ON releases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

CREATE POLICY "Only admin users can delete releases"
  ON releases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );