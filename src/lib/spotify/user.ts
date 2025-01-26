import { spotifyApi } from './api';
import { handleError } from '../utils/errorHandling';
import { logger } from '../utils/logger';
import { checkRateLimit } from './rateLimiter';

export interface UserTopArtists {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
}

export interface UserTopTracks {
  id: string;
  name: string;
  artists: {
    id: string;
    name: string;
  }[];
  album: {
    id: string;
    name: string;
    genres: string[];
  };
}

export async function getUserTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<UserTopArtists[]> {
  try {
    await checkRateLimit('user-top-read');
    const response = await spotifyApi.getMyTopArtists({ limit: 50, time_range: timeRange });
    
    return response.items.map(artist => ({
      id: artist.id,
      name: artist.name,
      genres: artist.genres,
      popularity: artist.popularity
    }));
  } catch (error) {
    logger.error('Failed to fetch user top artists', error);
    handleError(error);
    return [];
  }
}

export async function getUserTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<UserTopTracks[]> {
  try {
    await checkRateLimit('user-top-read');
    const response = await spotifyApi.getMyTopTracks({ limit: 50, time_range: timeRange });
    
    return response.items.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map(artist => ({
        id: artist.id,
        name: artist.name
      })),
      album: {
        id: track.album.id,
        name: track.album.name,
        genres: track.album.genres || []
      }
    }));
  } catch (error) {
    logger.error('Failed to fetch user top tracks', error);
    handleError(error);
    return [];
  }
}
