import { v4 as uuidv4 } from 'uuid';
import { ImageUploadError } from '../errors/releaseServiceErrors';
import { uploadImageFromUrl as storageUploadImageFromUrl } from './images';

export async function processReleaseImage(imageUrl: string): Promise<string> {
  if (!imageUrl.startsWith('http')) {
    return imageUrl; // Return as-is if it's not a URL (assuming it's already uploaded)
  }

  try {
    // Generate a UUID for the filename to ensure uniqueness
    const filename = `${uuidv4()}.jpg`;
    const uploadedUrl = await storageUploadImageFromUrl(imageUrl, filename);
    
    if (!uploadedUrl) {
      throw new ImageUploadError('Failed to upload image');
    }

    return uploadedUrl;
  } catch (error) {
    throw new ImageUploadError(
      error instanceof Error ? error.message : 'Unknown error during image upload'
    );
  }
}
