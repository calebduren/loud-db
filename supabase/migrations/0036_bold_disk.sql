/*
  # Add Spotify Integration

  1. New Tables
    - `spotify_connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `access_token` (text)
      - `refresh_token` (text)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `spotify_connections` table
    - Add policies for user access
*/

-- Create spotify_connections table
CREATE TABLE spotify_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE spotify_connections ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own spotify connection"
  ON spotify_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own spotify connection"
  ON spotify_connections FOR ALL
  USING (auth.uid() = user_id);

-- Add function to check if user has spotify connected
CREATE OR REPLACE FUNCTION has_spotify_connected(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM spotify_connections
    WHERE spotify_connections.user_id = has_spotify_connected.user_id
  );
END;
$$;