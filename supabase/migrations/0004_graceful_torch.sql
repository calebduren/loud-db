/*
  # Fix admin policies for releases table
  
  1. Changes
    - Update release policies to check admin role from profiles table instead of auth.users
  
  2. Security
    - Policies now correctly check admin status from profiles table
*/

-- Drop existing policies that check auth.users
DROP POLICY IF EXISTS "Only admin users can insert releases" ON releases;
DROP POLICY IF EXISTS "Only admin users can update releases" ON releases;
DROP POLICY IF EXISTS "Only admin users can delete releases" ON releases;

-- Create new policies that check profiles table
CREATE POLICY "Only admin users can insert releases"
  ON releases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admin users can update releases"
  ON releases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admin users can delete releases"
  ON releases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );