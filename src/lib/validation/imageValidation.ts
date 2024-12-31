import { MAX_IMAGE_SIZE_MB } from '../constants';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImage(file: File): ImageValidationResult {
  // Check file size (5MB limit)
  const maxSize = MAX_IMAGE_SIZE_MB * 1024 * 1024; // Convert MB to bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB`
    };
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'File must be an image'
    };
  }

  return { valid: true };
}