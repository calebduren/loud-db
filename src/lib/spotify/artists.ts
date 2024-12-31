import { spotifyApi } from './api';
import { SpotifyArtistDetails } from './types';
import { normalizeGenre } from '../utils/genreUtils';

export async function getArtistDetails(artistId: string): Promise<SpotifyArtistDetails | null> {
  try {
    const artist = await spotifyApi.getArtist(artistId);
    if (!artist) return null;

    // Initialize the artist details with normalized genres
    const details: SpotifyArtistDetails = {
      name: artist.name,
      genres: artist.genres.map(normalizeGenre),
      popularity: artist.popularity
    };

    try {
      const topTracks = await spotifyApi.getArtistTopTracks(artistId, 'US');
      if (topTracks?.tracks) {
        details.topTracks = topTracks.tracks.slice(0, 5).map(track => ({
          name: track.name,
          preview_url: track.preview_url
        }));
      }
    } catch (error) {
      console.warn('Could not fetch top tracks:', error);
    }

    try {
      const related = await spotifyApi.getArtistRelatedArtists(artistId);
      if (related?.artists) {
        details.relatedArtists = related.artists
          .slice(0, 5)
          .map(artist => ({
            name: artist.name,
            genres: artist.genres.map(normalizeGenre),
            popularity: artist.popularity
          }));
      }
    } catch (error) {
      console.warn('Could not fetch related artists:', error);
    }

    return details;
  } catch (error) {
    console.error('Error fetching artist details:', error);
    return null;
  }
}