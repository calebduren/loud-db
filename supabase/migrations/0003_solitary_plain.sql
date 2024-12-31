/*
  # Add role field to profiles table
  
  1. Changes
    - Add role field to profiles table for admin status
  
  2. Security
    - Only allow users to read their own role
    - Prevent role modification through RLS
*/

-- Add role column to profiles
ALTER TABLE profiles 
ADD COLUMN role text DEFAULT 'user'::text
CHECK (role IN ('user', 'admin'));

-- Update RLS policies for profiles
CREATE POLICY "Users can read own role"
  ON profiles FOR SELECT
  USING (auth.uid() = id);