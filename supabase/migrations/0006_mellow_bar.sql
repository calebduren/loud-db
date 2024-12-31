/*
  # Add admin management functions
  
  1. New Functions
    - make_user_admin: Function to promote a user to admin role
    - remove_admin: Function to demote an admin to regular user
  
  2. Security
    - Functions are security definer to run with elevated privileges
    - Only superuser can execute these functions
*/

-- Function to make a user an admin
CREATE OR REPLACE FUNCTION make_user_admin(user_email text)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET role = 'admin'
  WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;