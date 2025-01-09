/*
  # Fix usernames for existing users
  
  1. Changes
    - Update handle_new_user to generate better fallback usernames
    - Add function to generate a unique username from email
    - Update existing users with email-based usernames
*/

-- Function to generate a unique username from email
CREATE OR REPLACE FUNCTION generate_unique_username(email text)
RETURNS text AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 0;
BEGIN
  -- Extract username part from email (before @)
  base_username := split_part(email, '@', 1);
  
  -- Remove any +something from username (common in email aliases)
  base_username := split_part(base_username, '+', 1);
  
  -- Replace non-alphanumeric characters with underscores
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9]', '_', 'g');
  
  -- Initial attempt with base username
  final_username := base_username;
  
  -- Keep trying with incrementing numbers until we find a unique username
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter;
  END LOOP;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql;

-- Update handle_new_user to use the new username generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF new.id IS NOT NULL THEN
    INSERT INTO public.profiles (id, username, role)
    VALUES (
      new.id,
      COALESCE(
        new.raw_user_meta_data->>'username',
        generate_unique_username(new.email)
      ),
      'user'
    );
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users with email-based usernames
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN 
    SELECT p.id, p.username, u.email 
    FROM profiles p 
    JOIN auth.users u ON u.id = p.id
    WHERE p.username LIKE '%@%'
  LOOP
    UPDATE profiles 
    SET username = generate_unique_username(profile_record.email)
    WHERE id = profile_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
