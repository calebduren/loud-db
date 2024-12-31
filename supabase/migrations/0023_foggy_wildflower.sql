/*
  # Fix suspension check implementation
  
  1. Changes
    - Move suspension check to before sign in
    - Use auth.users table for better reliability
    - Add proper error handling
    
  2. Security
    - Function remains security definer
    - Proper schema search path set
*/

-- Drop previous implementation
DROP TRIGGER IF EXISTS check_suspension_on_sign_in ON auth.sessions;
DROP FUNCTION IF EXISTS auth.check_user_suspension();

-- Create new function to check suspension status
CREATE OR REPLACE FUNCTION auth.check_user_suspension(email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_suspended boolean;
BEGIN
  SELECT p.suspended INTO is_suspended
  FROM auth.users u
  JOIN profiles p ON p.id = u.id
  WHERE u.email = check_user_suspension.email;
  
  RETURN COALESCE(is_suspended, false);
END;
$$;

-- Create function to validate sign in
CREATE OR REPLACE FUNCTION auth.validate_user_sign_in()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.check_user_suspension(new.email::text) THEN
    RAISE EXCEPTION 'Your account has been suspended.';
  END IF;
  
  RETURN new;
END;
$$;

-- Create trigger to run validation before sign in
DROP TRIGGER IF EXISTS validate_sign_in ON auth.users;

CREATE TRIGGER validate_sign_in
  BEFORE UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.validate_user_sign_in();