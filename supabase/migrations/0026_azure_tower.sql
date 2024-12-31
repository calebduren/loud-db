/*
  # Fix avatar storage configuration
  
  1. Storage Setup
    - Ensure avatars bucket exists
    - Set proper public access
  
  2. Security
    - Drop and recreate policies with proper UUID handling
    - Add explicit bucket ownership policy
*/

-- Ensure avatars bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create bucket ownership policy
CREATE POLICY "Avatar bucket access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Create user-specific policies with proper UUID handling
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (auth.uid())::text = SPLIT_PART(name, '-', 1)
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (auth.uid())::text = SPLIT_PART(name, '-', 1)
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (auth.uid())::text = SPLIT_PART(name, '-', 1)
);