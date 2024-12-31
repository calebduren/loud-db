/*
  # Add unique constraint to username

  1. Changes
    - Add unique constraint to username column in profiles table
    - Add function to handle username conflicts
*/

-- First remove any duplicate usernames (keep the most recently updated one)
WITH duplicates AS (
  SELECT id, username,
    ROW_NUMBER() OVER (PARTITION BY username ORDER BY updated_at DESC) as rn
  FROM profiles
  WHERE username IS NOT NULL
)
UPDATE profiles
SET username = username || '_' || gen_random_uuid()
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE rn > 1
);

-- Add unique constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Create function to check username availability
CREATE OR REPLACE FUNCTION check_username_available(username text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.username = check_username_available.username
  );
END;
$$;