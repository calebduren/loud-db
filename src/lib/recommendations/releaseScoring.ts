import { Release } from '../types/database';

export interface Preferences {
  genreScores: { [genre: string]: number };
  artistScores: { [artistId: string]: number };
  spotifyGenreScores?: { [genre: string]: number };
  spotifyArtistScores?: { [artistId: string]: number };
}

export function scoreRelease(release: Release, preferences: Preferences): number {
  let score = 0;
  
  // Genre matching from user preferences
  release.genres.forEach(genre => {
    score += preferences.genreScores[genre] || 0;
  });

  // Artist matching from user preferences
  release.artists.forEach(({ artist }) => {
    score += (preferences.artistScores[artist.id] || 0) * 2; // Weight artist matches higher
  });

  // Genre matching from Spotify listening history
  if (preferences.spotifyGenreScores) {
    release.genres.forEach(genre => {
      score += (preferences.spotifyGenreScores?.[genre] || 0) * 1.5; // Weight Spotify genres slightly higher
    });
  }

  // Artist matching from Spotify listening history
  if (preferences.spotifyArtistScores) {
    release.artists.forEach(({ artist }) => {
      score += (preferences.spotifyArtistScores?.[artist.id] || 0) * 3; // Weight Spotify artists highest
    });
  }

  // Recency boost (newer releases score higher)
  const releaseDate = new Date(release.release_date);
  const daysSinceRelease = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 1 - (daysSinceRelease / 365)); // Higher score for newer releases
  
  score += recencyScore;

  return score;
}