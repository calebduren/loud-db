import { ArtistData } from '../types/forms';

export function validateArtists(artists: ArtistData[] | undefined): string | null {
  if (!artists || artists.length === 0) {
    return 'At least one artist is required';
  }

  const validArtists = artists.filter(a => a.name.trim());
  if (validArtists.length === 0) {
    return 'At least one valid artist is required';
  }

  return null;
}