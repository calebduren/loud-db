/*
  # Fix profile creation trigger

  1. Changes
    - Drop existing trigger if exists
    - Recreate trigger with proper error handling
*/

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF new.id IS NOT NULL THEN
    INSERT INTO public.profiles (id, username, role)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'username', new.email),
      'user'
    );
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();