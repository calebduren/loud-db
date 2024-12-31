/*
  # Update creator release management policies

  1. Changes
    - Update releases policies to allow creators to manage their own releases
    - Update related tables (tracks, track_credits) to allow creators to manage their releases' data
  
  2. Security
    - Creators can only edit releases they created
    - Maintains existing admin permissions
*/

-- Update releases policies to allow creators to manage their own releases
DROP POLICY IF EXISTS "Admin and creator users can insert releases" ON releases;
DROP POLICY IF EXISTS "Admin and creator users can update releases" ON releases;
DROP POLICY IF EXISTS "Admin and creator users can delete releases" ON releases;

CREATE POLICY "Admin and creator users can insert releases"
  ON releases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'creator')
    )
  );

CREATE POLICY "Admin and creator users can update own releases"
  ON releases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin' OR
        (profiles.role = 'creator' AND releases.created_by = auth.uid())
      )
    )
  );

CREATE POLICY "Admin and creator users can delete own releases"
  ON releases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin' OR
        (profiles.role = 'creator' AND releases.created_by = auth.uid())
      )
    )
  );

-- Update tracks policies
DROP POLICY IF EXISTS "Admin and creator users can manage tracks" ON tracks;

CREATE POLICY "Admin and creator users can manage tracks"
  ON tracks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN releases r ON r.id = tracks.release_id
      WHERE p.id = auth.uid()
      AND (
        p.role = 'admin' OR
        (p.role = 'creator' AND r.created_by = auth.uid())
      )
    )
  );

-- Update track_credits policies
DROP POLICY IF EXISTS "Admin and creator users can manage track credits" ON track_credits;

CREATE POLICY "Admin and creator users can manage track credits"
  ON track_credits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN releases r ON r.id = (
        SELECT release_id FROM tracks WHERE id = track_credits.track_id
      )
      WHERE p.id = auth.uid()
      AND (
        p.role = 'admin' OR
        (p.role = 'creator' AND r.created_by = auth.uid())
      )
    )
  );