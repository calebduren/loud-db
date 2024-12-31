import { ReleaseType } from '../../types/database';
import { SpotifyReleaseData } from './types';
import { SpotifyAlbum } from './types/album';
import { detectReleaseType } from './releaseTypeDetection';
import { filterValidGenres, normalizeGenre } from '../utils/genreUtils';
import { AppError } from '../errors/messages';
import { validateSpotifyUrl } from './validation';

function getAlbumIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('spotify.com')) return null;
    const path = urlObj.pathname;
    if (!path.includes('/album/')) return null;
    return path.split('/album/')[1].split('/')[0];
  } catch {
    return null;
  }
}

async function getClientCredentialsToken(): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`)}`
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function fetchReleaseFromSpotify(url: string): Promise<SpotifyReleaseData> {
  // Validate URL format
  const validation = validateSpotifyUrl(url);
  if (!validation.isValid) {
    throw new AppError('INVALID_URL');
  }

  const albumId = getAlbumIdFromUrl(url);
  if (!albumId) {
    throw new AppError('INVALID_URL');
  }

  const token = await getClientCredentialsToken();
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  try {
    // Fetch album
    const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers
    });
    
    if (!albumResponse.ok) {
      throw new AppError('IMPORT_FAILED');
    }

    const album: SpotifyAlbum = await albumResponse.json();

    // Fetch artist details to get genres
    const artistDetails = await Promise.all(
      album.artists.map(async (artist) => {
        if (!artist.id) return { name: artist.name, genres: [] };
        try {
          const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${artist.id}`, {
            headers
          });
          const details = await artistResponse.json();
          return {
            name: artist.name,
            genres: details.genres?.map(normalizeGenre) || []
          };
        } catch (error) {
          console.warn(`Could not fetch details for artist ${artist.name}:`, error);
          return { name: artist.name, genres: [] };
        }
      })
    );

    // Collect all unique genres
    const allGenres = new Set<string>();
    artistDetails.forEach(artist => {
      const validGenres = filterValidGenres(artist.genres);
      validGenres.forEach(genre => allGenres.add(genre));
    });

    return {
      name: album.name,
      artists: artistDetails,
      releaseType: detectReleaseType(album.album_type, album.total_tracks),
      coverUrl: album.images[0]?.url,
      genres: Array.from(allGenres),
      recordLabel: album.label,
      trackCount: album.total_tracks,
      releaseDate: album.release_date,
      spotify_url: url,
      tracks: album.tracks.items.map(track => ({
        name: track.name,
        duration_ms: track.duration_ms,
        track_number: track.track_number,
        preview_url: track.preview_url
      }))
    };
  } catch (error) {
    console.error('Error fetching from Spotify:', error);
    throw new AppError('IMPORT_FAILED', error instanceof Error ? error : undefined);
  }
}