-- Add suspended column to profiles
ALTER TABLE profiles
ADD COLUMN suspended boolean DEFAULT false;

-- Create function to suspend/unsuspend users
CREATE OR REPLACE FUNCTION toggle_user_suspension(user_email text, should_suspend boolean)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET suspended = should_suspend,
      updated_at = now()
  WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user role
CREATE OR REPLACE FUNCTION update_user_role(user_email text, new_role text)
RETURNS void AS $$
BEGIN
  IF new_role NOT IN ('user', 'creator', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  UPDATE profiles
  SET role = new_role,
      updated_at = now()
  WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;