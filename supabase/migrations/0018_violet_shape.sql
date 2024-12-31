/*
  # User Email Access
  
  1. Changes
    - Create a secure function to get user emails
    - Add policy to restrict access to admins only
  
  2. Security
    - Only admins can access user emails
    - Uses security definer function for controlled access
*/

-- Create function to get user emails (security definer ensures proper access control)
CREATE OR REPLACE FUNCTION get_user_email(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- Check if requesting user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RETURN NULL;
  END IF;

  -- Get email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;

  RETURN user_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email TO authenticated;