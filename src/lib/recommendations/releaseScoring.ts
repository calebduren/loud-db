import { Release } from '../types/database';

interface Preferences {
  genreScores: { [genre: string]: number };
  artistScores: { [artistId: string]: number };
}

export function scoreRelease(release: Release, preferences: Preferences): number {
  let score = 0;
  
  // Genre matching
  release.genres.forEach(genre => {
    score += preferences.genreScores[genre] || 0;
  });

  // Artist matching
  release.artists.forEach(({ artist }) => {
    score += (preferences.artistScores[artist.id] || 0) * 2; // Weight artist matches higher
  });

  // Recency boost (newer releases score higher)
  const releaseDate = new Date(release.release_date);
  const daysSinceRelease = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 1 - (daysSinceRelease / 365)); // Higher score for newer releases
  
  score += recencyScore;

  return score;
}