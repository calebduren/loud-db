import { useMemo } from 'react';
import { Release } from '../types/database';
import { calculateUserPreferences } from '../lib/recommendations/userPreferences';
import { scoreRelease } from '../lib/recommendations/releaseScoring';
import { useLikedReleases } from './useLikedReleases';

export function useRecommendedReleases(releases: Release[]) {
  const { releases: likedReleases } = useLikedReleases();

  return useMemo(() => {
    const preferences = calculateUserPreferences(likedReleases);
    
    return [...releases].sort((a, b) => {
      const scoreA = scoreRelease(a, preferences);
      const scoreB = scoreRelease(b, preferences);
      return scoreB - scoreA;
    });
  }, [releases, likedReleases]);
}