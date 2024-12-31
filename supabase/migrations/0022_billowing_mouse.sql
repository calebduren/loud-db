/*
  # Add suspension check function
  
  1. New Functions
    - check_user_suspension: Checks if a user is suspended before allowing login
    
  2. Security
    - Function is security definer to access profiles table
    - Only accessible during auth.sign_in
*/

-- Create function to check if user is suspended
CREATE OR REPLACE FUNCTION auth.check_user_suspension()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = new.user_id
    AND suspended = true
  ) THEN
    RAISE EXCEPTION 'Your account has been suspended.';
  END IF;
  
  RETURN new;
END;
$$;

-- Create trigger to run check on successful sign in
DROP TRIGGER IF EXISTS check_suspension_on_sign_in ON auth.sessions;

CREATE TRIGGER check_suspension_on_sign_in
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION auth.check_user_suspension();