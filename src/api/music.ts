import { logger } from '@/lib/logger';

interface OdesliResponse {
  linksByPlatform: {
    spotify?: {
      url: string;
    };
    appleMusic?: {
      url: string;
    };
  };
}

/**
 * Converts a Spotify URL to an Apple Music URL using the Odesli API
 * @param spotifyUrl The Spotify URL to convert
 * @returns The Apple Music URL if found, null otherwise
 */
export async function getAppleMusicUrl(spotifyUrl: string): Promise<string | null> {
  try {
    // Encode the Spotify URL
    const encodedUrl = encodeURIComponent(spotifyUrl);
    const response = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodedUrl}`);
    
    if (!response.ok) {
      throw new Error(`Odesli API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as OdesliResponse;
    
    // Return the Apple Music URL if it exists
    return data.linksByPlatform?.appleMusic?.url || null;
  } catch (error) {
    logger.error('Error converting Spotify URL to Apple Music:', error);
    return null;
  }
}
