import { useMemo } from 'react';
import { Release } from '../types/database';
import { useLikedReleases } from './useLikedReleases';
import { scoreRelease } from '../lib/recommendations/releaseScoring';
import { calculateUserPreferences } from '../lib/recommendations/userPreferences';
import { useSpotifyListeningHistory } from './useSpotifyListeningHistory';
import { useSpotifyConnection } from './useSpotifyConnection';

export function useRecommendedReleases(releases: Release[]) {
  const { releases: likedReleases } = useLikedReleases();
  const { isConnected } = useSpotifyConnection();
  const { topArtists, topTracks, loading: spotifyLoading } = useSpotifyListeningHistory();

  return useMemo(() => {
    const preferences = calculateUserPreferences(
      likedReleases || [],
      isConnected && !spotifyLoading ? { topArtists, topTracks } : undefined
    );
    
    return [...releases].sort((a, b) => {
      const scoreA = scoreRelease(a, preferences);
      const scoreB = scoreRelease(b, preferences);
      return scoreB - scoreA;
    });
  }, [releases, likedReleases, isConnected, spotifyLoading, topArtists, topTracks]);
}