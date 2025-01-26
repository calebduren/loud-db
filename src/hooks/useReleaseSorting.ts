import { useMemo, useCallback } from "react";
import { Release } from "../types/database";
import { useGenrePreferences } from "./settings/useGenrePreferences";
import { useGenreGroups } from "./useGenreGroups";
import { useLikedReleases } from "./useLikedReleases";
import { useSpotifyListeningHistory } from "./useSpotifyListeningHistory";
import { useSpotifyConnection } from "./useSpotifyConnection";
import { calculateUserPreferences } from "../lib/recommendations/userPreferences";
import { scoreRelease } from "../lib/recommendations/releaseScoring";

export function useReleaseSorting() {
  const { preferences: genrePreferences } = useGenrePreferences();
  const { genreGroups } = useGenreGroups();
  const { releases: likedReleases } = useLikedReleases();
  const { isConnected } = useSpotifyConnection();
  const { topArtists, topTracks, loading: spotifyLoading } = useSpotifyListeningHistory();

  // Calculate user preferences combining liked releases and Spotify history
  const preferences = useMemo(() => {
    return calculateUserPreferences(
      likedReleases || [],
      isConnected && !spotifyLoading ? { topArtists, topTracks } : undefined
    );
  }, [likedReleases, isConnected, spotifyLoading, topArtists, topTracks]);

  const sortReleases = useCallback(
    (releases: Release[]) => {
      if (!releases?.length) return [];
      
      // Calculate scores for all releases
      const scoredReleases = releases.map(release => {
        const score = scoreRelease(release, preferences);
        const hasLikedArtist = release.artists?.some(
          ({ artist }) => preferences.artistScores[artist.id] > 0 || 
                         (preferences.spotifyArtistScores?.[artist.id] || 0) > 0.8
        );
        
        return {
          release,
          score,
          hasLikedArtist
        };
      });

      // Calculate the score threshold for top 0.5%
      const validScores = scoredReleases
        .map(r => r.score)
        .filter(score => score > -Infinity && score >= 0);
      const recommendationThreshold = validScores.length > 0
        ? validScores[Math.floor(validScores.length * 0.995)]
        : 0;

      // Mark releases as recommended if they meet criteria
      scoredReleases.forEach(scored => {
        const hasMultipleLikedArtists = scored.release.artists?.filter(
          ({ artist }) => 
            preferences.artistScores[artist.id] > 0 || 
            (preferences.spotifyArtistScores?.[artist.id] || 0) > 0.8
        ).length >= 2;

        scored.isRecommended = 
          hasMultipleLikedArtists || // Has 2+ liked artists
          scored.score >= recommendationThreshold; // In top 0.5%
      });

      // Sort by score
      return scoredReleases
        .sort((a, b) => b.score - a.score)
        .map(({ release, score, isRecommended }) => ({
          ...release,
          _score: score,
          isRecommended
        }));
    },
    [preferences]
  );

  return { sortReleases };
}
