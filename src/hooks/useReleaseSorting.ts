import { useMemo } from 'react';
import { Release } from '../types/database';
import { useGenrePreferences } from './settings/useGenrePreferences';
import { useGenreGroups } from './useGenreGroups';
import { useLikes } from './useLikes';

export function useReleaseSorting() {
  const { preferences, loading: preferencesLoading } = useGenrePreferences();
  const { genreGroups, loading: groupsLoading } = useGenreGroups();
  const { likedReleases, loading: likesLoading } = useLikes();

  const sortReleases = useMemo(() => {
    return (releases: Release[]) => {
      if (!releases?.length || !preferences || !genreGroups) {
        return releases || [];
      }

      return [...releases].sort((a, b) => {
        const scoreA = calculateReleaseScore(a, preferences, genreGroups, likedReleases, releases);
        const scoreB = calculateReleaseScore(b, preferences, genreGroups, likedReleases, releases);
        return scoreB - scoreA;
      });
    };
  }, [preferences, genreGroups, likedReleases]);

  return {
    sortReleases,
    loading: preferencesLoading || groupsLoading || likesLoading
  };
}

function calculateReleaseScore(
  release: Release,
  preferences: Record<string, number>,
  genreGroups: Record<string, string[]>,
  likedReleases: Set<string>,
  allReleases: Release[]
): number {
  if (!release) return -Infinity;
  
  let score = 0;

  // Base penalty for no genres
  if (!release.genres?.length) {
    score -= 10000;
  }

  // Genre preference scoring
  const matchedGroups = new Set<string>();
  for (const genre of release.genres || []) {
    for (const [groupName, groupGenres] of Object.entries(genreGroups)) {
      if (groupGenres.includes(genre)) {
        // Only count each group once per release
        if (!matchedGroups.has(groupName)) {
          const preferenceScore = preferences[groupName] || 0;
          score += preferenceScore * 2000; // Scale up preference scores
          matchedGroups.add(groupName);
        }
      }
    }
  }

  // Boost score if user has liked similar releases
  if (release.artists && likedReleases?.size > 0) {
    const artistIds = new Set(release.artists.map(a => a.artist?.id).filter(Boolean));
    let similarLikedCount = 0;
    
    for (const likedId of likedReleases) {
      const likedRelease = allReleases.find(r => r.id === likedId);
      if (likedRelease?.artists && likedRelease?.genres) {
        // Check for shared artists
        const likedArtistIds = new Set(likedRelease.artists.map(a => a.artist?.id).filter(Boolean));
        const hasSharedArtist = Array.from(artistIds).some(id => id && likedArtistIds.has(id));
        
        // Check for shared genres
        const likedGenres = new Set(likedRelease.genres);
        const hasSharedGenre = (release.genres || []).some(g => likedGenres.has(g));
        
        if (hasSharedArtist || hasSharedGenre) {
          similarLikedCount++;
        }
      }
    }
    
    // Add bonus for similar liked releases
    score += similarLikedCount * 1000;
  }

  // Small recency bonus (max 500 points for newest releases)
  if (release.release_date) {
    const daysOld = (Date.now() - new Date(release.release_date).getTime()) / (1000 * 60 * 60 * 24);
    const recencyBonus = Math.max(0, 500 - daysOld);
    score += recencyBonus;
  }

  return score;
}