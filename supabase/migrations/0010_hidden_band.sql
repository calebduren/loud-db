/*
  # Add release date to releases table

  1. Changes
    - Add `release_date` column to `releases` table
    - Set default value to current timestamp
    - Make column required (NOT NULL)
    - Add index for better query performance when sorting by date

  2. Notes
    - Uses timestamptz for timezone awareness
    - Default to current timestamp for backward compatibility
*/

-- Add release_date column
ALTER TABLE releases 
ADD COLUMN release_date timestamptz NOT NULL DEFAULT now();

-- Create index for release_date
CREATE INDEX idx_releases_release_date ON releases(release_date DESC);