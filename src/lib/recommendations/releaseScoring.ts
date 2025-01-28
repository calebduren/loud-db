import { Release } from '../types/database';

export interface Preferences {
  genreScores: { [genre: string]: number };
  artistScores: { [artistId: string]: number };
  spotifyGenreScores?: { [genre: string]: number };
  spotifyArtistScores?: { [artistId: string]: number };
}

export function scoreRelease(release: Release, preferences: Preferences): number {
  let score = 0;
  
  // Penalize releases with no genres
  if (!release.genres?.length) {
    score -= 2; // Significant penalty for no genres
  }

  // Genre matching from user preferences (including genre group preferences)
  if (release.genres?.length) {
    release.genres.forEach(genre => {
      // Genre scores now include both liked releases and genre group preferences
      const genreScore = preferences.genreScores[genre] || 0;
      score += genreScore * 2; // Weight genre preferences higher
    });
  }

  // Artist matching from user preferences
  release.artists?.forEach(({ artist }) => {
    score += (preferences.artistScores[artist.id] || 0) * 2; // Weight artist matches higher
  });

  // Genre matching from Spotify listening history
  if (preferences.spotifyGenreScores && release.genres?.length) {
    release.genres.forEach(genre => {
      score += (preferences.spotifyGenreScores?.[genre] || 0) * 1.5; // Weight Spotify genres slightly higher
    });
  }

  // Artist matching from Spotify listening history
  if (preferences.spotifyArtistScores) {
    let maxArtistScore = 0;
    release.artists?.forEach(({ artist }) => {
      const artistScore = preferences.spotifyArtistScores?.[artist.id] || 0;
      maxArtistScore = Math.max(maxArtistScore, artistScore);
    });
    // Use the highest artist score with a higher weight
    score += maxArtistScore * 5; // Increased weight for Spotify artists
  }

  return score;
}