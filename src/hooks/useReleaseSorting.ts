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
      
      console.log('Preferences:', preferences);
      console.log('Spotify artist scores:', preferences.spotifyArtistScores);
      
      // Calculate scores for all releases
      const scoredReleases = releases.map(release => {
        const score = scoreRelease(release, preferences);
        const hasTopArtist = release.artists?.some(
          ({ artist }) => {
            const spotifyScore = preferences.spotifyArtistScores?.[artist.id] || 0;
            // Lowered threshold from 0.9 to 0.7 (top 30% instead of top 10%)
            const isTopArtist = spotifyScore > 0.7;
            console.log(`Artist "${artist.name}" score:`, spotifyScore, 'isTop:', isTopArtist);
            return isTopArtist;
          }
        );
        
        console.log(`Release "${release.name}":`, {
          score,
          hasTopArtist,
          artists: release.artists?.map(({ artist }) => artist.name)
        });

        return {
          release,
          score,
          hasTopArtist
        };
      });

      // Calculate the score threshold for top 2% (increased from 0.1%)
      const validScores = scoredReleases
        .map(r => r.score)
        .filter(score => score > -Infinity && score >= 0)
        .sort((a, b) => b - a);
      
      const recommendationThreshold = validScores.length > 0
        ? validScores[Math.floor(validScores.length * 0.02)] // Top 2%
        : 0;

      console.log('Valid scores:', validScores);
      console.log('Recommendation threshold:', recommendationThreshold);

      // Mark releases as recommended if they meet criteria
      const recommendedReleases = scoredReleases.map(scored => {
        const isRecommended = 
          scored.hasTopArtist || // Has a top artist (with higher threshold)
          scored.score >= recommendationThreshold; // In top 2%
        
        if (isRecommended) {
          console.log(`Recommended "${scored.release.name}" because:`, {
            hasTopArtist: scored.hasTopArtist,
            score: scored.score,
            threshold: recommendationThreshold
          });
        }

        return {
          ...scored.release,
          _score: scored.score,
          isRecommended
        };
      });

      // Sort by score
      return recommendedReleases.sort((a, b) => (b._score || 0) - (a._score || 0));
    },
    [preferences]
  );

  return { sortReleases };
}
