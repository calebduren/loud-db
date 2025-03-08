import { v4 as uuidv4 } from 'uuid';
import { ImageUploadError } from '../errors/releaseServiceErrors';
import { uploadImageFromUrl as storageUploadImageFromUrl } from './images';
import { normalizeUrl } from '../utils/environmentUtils';

export async function processReleaseImage(imageUrl: string): Promise<string> {
  if (!imageUrl.startsWith('http')) {
    return imageUrl; // Return as-is if it's not a URL (assuming it's already uploaded)
  }

  try {
    // Generate a UUID for the filename to ensure uniqueness
    const filename = `${uuidv4()}.jpg`;
    
    // Use the normalized URL for processing
    const normalizedImageUrl = normalizeUrl(imageUrl) || imageUrl;
    const uploadedUrl = await storageUploadImageFromUrl(normalizedImageUrl, filename);
    
    if (!uploadedUrl) {
      throw new ImageUploadError('Failed to upload image');
    }

    return uploadedUrl;
  } catch (error) {
    console.warn('Image processing failed, using original URL:', error);
    // Return the original URL instead of throwing an error
    // This allows the form to be submitted even when image processing fails
    return imageUrl;
  }
}
