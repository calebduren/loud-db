/*
  # Genre Mapping System

  1. New Tables
    - `genre_groups`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    - `genre_mappings`
      - `id` (uuid, primary key)
      - `genre` (text)
      - `group_id` (uuid, references genre_groups)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for admin access
*/

-- Create genre groups table
CREATE TABLE genre_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create genre mappings table
CREATE TABLE genre_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  genre text NOT NULL,
  group_id uuid REFERENCES genre_groups(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(genre)
);

-- Enable RLS
ALTER TABLE genre_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre_mappings ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Genre groups are viewable by everyone"
  ON genre_groups FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage genre groups"
  ON genre_groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Genre mappings are viewable by everyone"
  ON genre_mappings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage genre mappings"
  ON genre_mappings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create helper function to map genre to group
CREATE OR REPLACE FUNCTION get_genre_group(input_genre text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  group_name text;
BEGIN
  SELECT g.name INTO group_name
  FROM genre_mappings m
  JOIN genre_groups g ON g.id = m.group_id
  WHERE m.genre = input_genre;
  
  RETURN COALESCE(group_name, input_genre);
END;
$$;