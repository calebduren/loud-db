import { useMemo } from "react";
import { Release } from "../types/database";
import { useGenrePreferences } from "./settings/useGenrePreferences";
import { useGenreGroups } from "./useGenreGroups";
import { useLikedReleases } from "./useLikedReleases";

// Move scoring logic outside the hook to prevent recreation
function calculateReleaseScore(
  release: Release,
  preferences: Record<string, number>,
  genreGroups: Record<string, string[]>,
  genrePreferences: Map<string, number>
): { score: number; details: string[] } {
  if (!release?.genres?.length) {
    return { score: -Infinity, details: ["No genres"] };
  }

  let score = 0;
  let maxPreferenceScore = -1;
  let hasOnlyZeroStars = true;
  const details: string[] = [];

  // First pass: Find the highest preference score and check if we have any non-zero ratings
  for (const genre of release.genres) {
    let genreMaxScore = -1;
    let genreHasRating = false;

    // Check all genre groups this genre belongs to
    for (const [groupName, groupGenres] of Object.entries(genreGroups)) {
      if (groupGenres.includes(genre)) {
        genreHasRating = true;
        const preferenceScore = preferences[groupName] || 0;
        genreMaxScore = Math.max(genreMaxScore, preferenceScore);
      }
    }

    // If this genre has any rating and its max score is > 0, we don't have only zero stars
    if (genreHasRating && genreMaxScore > 0) {
      hasOnlyZeroStars = false;
    }

    maxPreferenceScore = Math.max(maxPreferenceScore, genreMaxScore);
  }

  // If all rated genres are 0 stars, give a very low score (but above no-genre releases)
  if (hasOnlyZeroStars) {
    return { score: -1, details: ["All genres rated 0 stars or unrated"] };
  }

  // Base score from highest preference (ensures 5-star genres are always above 4-star, etc.)
  if (maxPreferenceScore > 0) {
    score = maxPreferenceScore * 1000000;
    details.push(`Base score from ${maxPreferenceScore}-star genre: ${score}`);
  }

  // Second pass: Add bonus points for each genre
  for (const genre of release.genres) {
    // Points from liked releases
    const likedScore = genrePreferences.get(genre) || 0;
    if (likedScore > 0) {
      const likedBonus = likedScore * 1000;
      score += likedBonus;
      details.push(`Liked genre bonus for ${genre}: +${likedBonus}`);
    }

    // Get all genre groups this genre belongs to
    const genreGroupScores = Object.entries(genreGroups)
      .filter(([_, groupGenres]) => groupGenres.includes(genre))
      .map(([groupName]) => ({
        groupName,
        score: preferences[groupName] || 0,
      }))
      .sort((a, b) => b.score - a.score); // Sort by score to prioritize higher-rated groups

    // Add points for each group, with diminishing returns for multiple groups
    genreGroupScores.forEach((group, index) => {
      // Calculate diminishing returns multiplier (100% for first, 50% for second, etc.)
      const diminishingMultiplier = 1 / (index + 1);

      if (group.score > 0) {
        const genreBonus = group.score * 100 * diminishingMultiplier;
        score += genreBonus;
        details.push(
          `Genre bonus for ${genre} in ${group.groupName} (${
            group.score
          } stars, ${(diminishingMultiplier * 100).toFixed(
            0
          )}% weight): +${genreBonus.toFixed(1)}`
        );
      } else if (group.score === 0) {
        // Penalty for 0-star ratings, but don't let it override higher ratings
        const penalty = -1000 * diminishingMultiplier;
        score += penalty;
        details.push(
          `0-star penalty for ${genre} in ${group.groupName} (${(
            diminishingMultiplier * 100
          ).toFixed(0)}% weight): ${penalty.toFixed(1)}`
        );
      }
    });
  }

  // Small recency bonus
  if (release.release_date) {
    const daysOld =
      (Date.now() - new Date(release.release_date).getTime()) /
      (1000 * 60 * 60 * 24);
    const recencyBonus = Math.max(0, 100 - daysOld);
    score += recencyBonus;
    details.push(`Recency bonus: +${recencyBonus.toFixed(2)}`);
  }

  return { score, details };
}

export function useReleaseSorting() {
  const { preferences, loading: preferencesLoading } = useGenrePreferences();
  const { genreGroups, loading: groupsLoading } = useGenreGroups();
  const { releases: likedReleases } = useLikedReleases();

  // Create genre preferences map once
  const genrePreferences = useMemo(() => {
    const map = new Map<string, number>();
    likedReleases?.forEach((release) => {
      release.genres?.forEach((genre) => {
        map.set(genre, (map.get(genre) || 0) + 1);
      });
    });
    return map;
  }, [likedReleases]);

  // Create sort function that uses the current state
  const sortReleases = useMemo(() => {
    return (releases: Release[]) => {
      if (!releases?.length) return releases || [];
      if (preferencesLoading || groupsLoading) return releases;

      // Calculate scores once for all releases
      const scores = new Map<string, number>();
      const details = new Map<string, string[]>();

      releases.forEach((release) => {
        const result = calculateReleaseScore(
          release,
          preferences || {},
          genreGroups || {},
          genrePreferences
        );
        scores.set(release.id, result.score);
        details.set(release.id, result.details);
      });

      // Sort based on pre-calculated scores
      return [...releases].sort((a, b) => {
        const scoreA = scores.get(a.id) ?? -Infinity;
        const scoreB = scores.get(b.id) ?? -Infinity;
        return scoreB - scoreA;
      });
    };
  }, [
    preferences,
    genreGroups,
    genrePreferences,
    preferencesLoading,
    groupsLoading,
  ]);

  return {
    sortReleases,
    loading: preferencesLoading || groupsLoading,
  };
}
