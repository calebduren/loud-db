/*
  # Add release likes functionality

  1. New Tables
    - `release_likes`
      - `release_id` (uuid, references releases)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `release_likes` table
    - Add policies for authenticated users to:
      - View all likes
      - Create/delete their own likes
*/

CREATE TABLE IF NOT EXISTS release_likes (
  release_id uuid REFERENCES releases(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (release_id, user_id)
);

-- Enable RLS
ALTER TABLE release_likes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Release likes are viewable by everyone"
  ON release_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like releases"
  ON release_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike releases"
  ON release_likes FOR DELETE
  USING (auth.uid() = user_id);