import { useMemo, useState, useEffect } from 'react';
import { Release } from '../types/database';
import { useGenrePreferences } from './settings/useGenrePreferences';
import { useGenreGroups } from './useGenreGroups';

export function useReleaseSorting(releases: Release[]) {
  const { preferences, loading: preferencesLoading } = useGenrePreferences();
  const { genreGroups, loading: groupsLoading } = useGenreGroups();
  const [sortedReleases, setSortedReleases] = useState<Release[]>([]);
  const [sorting, setSorting] = useState(true);

  useEffect(() => {
    if (!releases.length || preferencesLoading || groupsLoading) {
      setSorting(true);
      return;
    }

    // Use setTimeout to ensure UI shows loading state
    const timeoutId = setTimeout(() => {
      const sorted = [...releases].sort((a, b) => {
        // First apply genre preference scoring
        const scoreA = calculateReleaseScore(a, preferences, genreGroups);
        const scoreB = calculateReleaseScore(b, preferences, genreGroups);
        
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // Higher scores first
        }

        // If scores are equal, sort by date
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      });

      setSortedReleases(sorted);
      setSorting(false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [releases, preferences, genreGroups, preferencesLoading, groupsLoading]);

  return {
    releases: sortedReleases,
    loading: sorting || preferencesLoading || groupsLoading
  };
}

function calculateReleaseScore(
  release: Release,
  preferences: Record<string, number>,
  genreGroups: Record<string, string[]>
): number {
  if (!release.genres?.length) return -1000; // Penalize releases without genres

  let totalScore = 0;
  let matchedGroups = new Set<string>();

  // Check each genre against genre groups
  for (const genre of release.genres) {
    for (const [groupName, groupGenres] of Object.entries(genreGroups)) {
      if (groupGenres.includes(genre)) {
        // Only count each group once per release
        if (!matchedGroups.has(groupName)) {
          const preferenceScore = preferences[groupName] || 0;
          totalScore += preferenceScore * 1000; // Scale up scores significantly
          matchedGroups.add(groupName);
        }
      }
    }
  }

  // Apply recency boost (small bonus for newer releases)
  const daysOld = (Date.now() - new Date(release.release_date).getTime()) / (1000 * 60 * 60 * 24);
  const recencyBonus = Math.max(0, 100 - daysOld); // Up to 100 point bonus for new releases

  return totalScore + recencyBonus;
}