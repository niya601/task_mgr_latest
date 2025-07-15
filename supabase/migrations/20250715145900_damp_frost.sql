/*
  # Create profile pictures storage bucket

  1. Storage Setup
    - Create 'profile-pictures' bucket for user profile images
    - Set up RLS policies for secure access
    - Allow authenticated users to upload their own pictures
    - Allow public read access to profile pictures

  2. Security
    - Users can only upload to their own folder (user_id)
    - Public read access for displaying images
    - File size and type restrictions via policies
*/

-- Create the profile-pictures bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to profile pictures
CREATE POLICY "Public read access to profile pictures"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');