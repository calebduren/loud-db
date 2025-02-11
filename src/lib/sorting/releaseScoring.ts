import { Release } from '../../types/database';

const NO_GENRES_PENALTY = -1000; // Severe penalty for releases without any genres
const NO_MATCHES_PENALTY = -500;  // Penalty for releases with no matching genres
const BASE_SCORE = 100; // Base score for each genre match

export function scoreReleasesByPreference(
  releases: Release[],
  preferences: Record<string, number>,
  genreGroups: Record<string, string[]>,
  skipPreferences?: boolean
): Release[] {
  // If no preferences set, return releases in chronological order
  if (skipPreferences || Object.keys(preferences).length === 0) {
    return [...releases].sort((a, b) => 
      new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    );
  }

  // Score and sort releases
  const scoredReleases = releases.map(release => ({
    release,
    score: calculateReleaseScore(release, preferences, genreGroups)
  }));

  return scoredReleases
    .sort((a, b) => {
      // First sort by score
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      // Then by release date if scores are equal
      return new Date(b.release.release_date).getTime() - 
             new Date(a.release.release_date).getTime();
    })
    .map(({ release }) => release);
}

function calculateReleaseScore(
  release: Release,
  preferences: Record<string, number>,
  genreGroups: Record<string, string[]>
): number {
  // Penalize releases without genres
  if (!release.genres || release.genres.length === 0) {
    return NO_GENRES_PENALTY;
  }

  let totalScore = 0;
  let matchedGroups = new Set<string>();
  let hasAnyMatch = false;

  // Check each genre against genre groups
  for (const genre of release.genres) {
    for (const [groupName, groupGenres] of Object.entries(genreGroups)) {
      if (groupGenres.includes(genre)) {
        hasAnyMatch = true;
        // Only count each group once per release
        if (!matchedGroups.has(groupName)) {
          const preferenceScore = preferences[groupName] || 0;
          // Scale preference score to have more impact
          totalScore += preferenceScore * BASE_SCORE;
          matchedGroups.add(groupName);
        }
      }
    }
  }

  // If no genres matched any preference groups, apply penalty
  if (!hasAnyMatch) {
    return NO_MATCHES_PENALTY;
  }

  // Add a small boost for releases with more genre matches
  totalScore += matchedGroups.size * 10;

  return totalScore;
}