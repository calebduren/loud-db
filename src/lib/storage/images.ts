import { supabase } from '../supabase';

/**
 * Downloads an image from a URL and uploads it to Supabase storage
 * @param imageUrl The URL of the image to download
 * @param path The path in storage where the image should be stored
 * @returns The URL of the uploaded image in Supabase storage
 */
export async function uploadImageFromUrl(imageUrl: string, path: string): Promise<string> {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const blob = await response.blob();
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('covers')
      .upload(path, blob, {
        contentType: blob.type,
        upsert: true
      });

    if (error) {
      throw error;
    }

    if (!data?.path) {
      throw new Error('No path returned from upload');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
