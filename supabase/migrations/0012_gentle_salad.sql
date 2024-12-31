/*
  # Create storage bucket for cover images
  
  1. Changes
    - Creates a new public storage bucket for cover images
    - Sets up RLS policies for the bucket
*/

-- Create the covers bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the covers bucket
CREATE POLICY "Cover images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Only admin users can upload cover images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'covers' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admin users can update cover images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'covers'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admin users can delete cover images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'covers'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);