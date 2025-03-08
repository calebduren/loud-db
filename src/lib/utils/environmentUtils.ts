/**
 * Utilities for handling environment-specific configurations
 */

// Check if we're in development mode
export const isDevelopment = import.meta.env.MODE === 'development';

// Get the Supabase URL from environment variables
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

/**
 * Normalizes a URL based on the current environment
 * 
 * In development mode:
 * - If the URL points to the production Supabase instance, it will be transformed to use the local instance
 * - This allows the application to work with production data while using local services
 * 
 * @param url The URL to normalize
 * @returns The normalized URL for the current environment
 */
export function normalizeUrl(url: string | null): string | null {
  if (!url) return url;
  
  // If we're in development and the URL points to the production Supabase storage
  if (isDevelopment && url.includes('supabase.co/storage')) {
    // Extract the path from the URL (everything after /storage/)
    const storagePathMatch = url.match(/\/storage\/(.+)/);
    if (storagePathMatch && storagePathMatch[1]) {
      // Construct a new URL using the local Supabase URL
      return `${supabaseUrl}/storage/${storagePathMatch[1]}`;
    }
  }
  
  return url;
}

/**
 * Denormalizes a URL to ensure it points to the production environment
 * 
 * This is useful when storing URLs that should always point to production,
 * regardless of which environment the code is running in.
 * 
 * @param url The URL to denormalize
 * @returns The denormalized URL that points to production
 */
export function denormalizeUrl(url: string | null): string | null {
  if (!url) return url;
  
  // If we're in development and the URL points to the local Supabase storage
  if (isDevelopment && url.includes('127.0.0.1') && url.includes('/storage/')) {
    // Replace the local URL with the production URL format
    // Note: This is a simplified approach and might need adjustment based on your actual URL structure
    const productionSupabaseUrl = 'https://qktmaijcddbzdwwcuewe.supabase.co';
    const storagePathMatch = url.match(/\/storage\/(.+)/);
    
    if (storagePathMatch && storagePathMatch[1]) {
      return `${productionSupabaseUrl}/storage/${storagePathMatch[1]}`;
    }
  }
  
  return url;
}
