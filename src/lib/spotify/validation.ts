import { AppError } from '../errors/messages';

export function validateSpotifyUrl(url: string): { isValid: boolean; error?: string } {
  try {
    const urlObj = new URL(url);
    
    // Check if it's a Spotify URL
    if (!urlObj.hostname.includes('spotify.com')) {
      return { isValid: false, error: 'Please enter a valid Spotify URL' };
    }

    // Check if it's an album URL
    const path = urlObj.pathname;
    if (!path.includes('/album/')) {
      return { 
        isValid: false, 
        error: 'Please use an album URL (e.g., https://open.spotify.com/album/...) instead of a track URL' 
      };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
}