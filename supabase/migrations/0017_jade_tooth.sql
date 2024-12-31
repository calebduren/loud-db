-- Update functions to use user_id instead of email
CREATE OR REPLACE FUNCTION update_user_role(user_id uuid, new_role text)
RETURNS void AS $$
BEGIN
  IF new_role NOT IN ('user', 'creator', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  UPDATE profiles
  SET role = new_role,
      updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION toggle_user_suspension(user_id uuid, should_suspend boolean)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET suspended = should_suspend,
      updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;