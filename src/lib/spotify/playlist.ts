import { getClientCredentialsToken } from './client';
import { SpotifyAlbum } from './types/album';
import { AppError } from '../errors/messages';

function getPlaylistIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('spotify.com')) return null;
    const path = urlObj.pathname;
    if (!path.includes('/playlist/')) return null;
    
    // Remove query parameters and get the playlist ID
    const playlistId = path.split('/playlist/')[1].split('?')[0].split('/')[0];
    
    // Debug logging
    console.log('URL:', url);
    console.log('Hostname:', urlObj.hostname);
    console.log('Path:', path);
    console.log('Playlist ID:', playlistId);
    
    return playlistId;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

interface PlaylistTrack {
  track: {
    album: SpotifyAlbum;
  };
}

export async function fetchPlaylistAlbums(playlistUrl: string): Promise<SpotifyAlbum[]> {
  const playlistId = getPlaylistIdFromUrl(playlistUrl);
  if (!playlistId) {
    throw new AppError('INVALID_URL');
  }

  const token = await getClientCredentialsToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    // First, fetch the playlist metadata
    const playlistEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}?fields=name,tracks.total`;
    console.log('Fetching playlist from:', playlistEndpoint);
    
    const playlistResponse = await fetch(playlistEndpoint, {
      headers
    });
    
    if (!playlistResponse.ok) {
      console.error('Playlist response error:', {
        status: playlistResponse.status,
        statusText: playlistResponse.statusText
      });
      
      if (playlistResponse.status === 404) {
        throw new AppError('NOT_FOUND');
      } else if (playlistResponse.status === 401) {
        throw new AppError('Invalid or expired Spotify token. Please check your credentials.');
      } else if (playlistResponse.status === 403) {
        const responseText = await playlistResponse.text();
        if (responseText.includes('premium') || playlistUrl.includes('spotify/playlist')) {
          throw new AppError('This appears to be a Spotify editorial playlist. These playlists cannot be imported directly. Please create a copy of the playlist to your own account and try importing that instead.');
        }
        throw new AppError('Access denied. Make sure the playlist is public.');
      }
      throw new AppError('SPOTIFY_API_ERROR');
    }

    const playlistData = await playlistResponse.json();
    console.log('Playlist data:', {
      name: playlistData.name,
      totalTracks: playlistData.tracks.total
    });
    
    const totalTracks = playlistData.tracks.total;
    const tracks: PlaylistTrack[] = [];

    // Fetch all tracks in chunks of 100
    for (let offset = 0; offset < totalTracks; offset += 100) {
      const tracksEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=100&fields=items(track(album))`;
      console.log('Fetching tracks from:', tracksEndpoint);
      
      const tracksResponse = await fetch(tracksEndpoint, { headers });

      if (!tracksResponse.ok) {
        console.error('Tracks response error:', {
          status: tracksResponse.status,
          statusText: tracksResponse.statusText,
          body: await tracksResponse.text()
        });
        throw new AppError('SPOTIFY_API_ERROR');
      }

      const tracksData = await tracksResponse.json();
      tracks.push(...tracksData.items);
    }

    // Extract unique albums
    const uniqueAlbums = new Map<string, SpotifyAlbum>();
    tracks.forEach(item => {
      if (item.track && item.track.album) {
        uniqueAlbums.set(item.track.album.id, item.track.album);
      }
    });

    const albums = Array.from(uniqueAlbums.values());
    console.log('Found albums:', albums.length);
    
    return albums;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching playlist:', error);
    throw new AppError('SPOTIFY_API_ERROR');
  }
}
