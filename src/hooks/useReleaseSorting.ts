import { useMemo, useCallback } from "react";
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
): { score: number; details: string[]; isRecommended: boolean } {
  if (!release?.genres?.length) {
    return { score: -Infinity, details: ["No genres"], isRecommended: false };
  }

  console.log("\n=== Scoring Release ===");
  console.log("Release:", release.name);
  console.log("Genres:", release.genres);

  let score = 0;
  let maxPreferenceScore = -1;
  let hasAnyZeroStars = false;
  let hasAnyRatedGenres = false;
  const details: string[] = [];
  let hasLikedArtist = false;
  let zeroStarGenres: string[] = [];
  let ratedGenres: string[] = [];

  // Check if any artists are in liked releases
  for (const { artist } of release.artists) {
    if (genrePreferences.has(`artist:${artist.id}`)) {
      hasLikedArtist = true;
      const artistBonus = 1000000; // Large bonus for liked artists
      score += artistBonus;
      details.push(`Liked artist bonus for ${artist.name}: +${artistBonus}`);
    }
  }

  // First pass: Find the highest preference score and check for zero-star ratings
  for (const genre of release.genres) {
    let genreMaxScore = -1;
    let genreHasRating = false;
    let matchedGroups: string[] = [];

    // Check all genre groups this genre belongs to
    for (const [groupName, groupGenres] of Object.entries(genreGroups)) {
      // Use exact matching since we're using the genre_mappings table
      if (groupGenres.includes(genre)) {
        genreHasRating = true;
        matchedGroups.push(groupName);
        const preferenceScore = preferences[groupName] || 0;
        if (preferenceScore === 0) {
          hasAnyZeroStars = true;
          zeroStarGenres.push(`${genre} (in ${groupName})`);
        } else if (preferenceScore > 0) {
          hasAnyRatedGenres = true;
          ratedGenres.push(`${genre} (${preferenceScore} stars in ${groupName})`);
        }
        genreMaxScore = Math.max(genreMaxScore, preferenceScore);
      }
    }

    console.log(`Genre "${genre}":`, {
      matchedGroups,
      maxScore: genreMaxScore,
      hasRating: genreHasRating
    });

    maxPreferenceScore = Math.max(maxPreferenceScore, genreMaxScore);
  }

  console.log("Zero-star genres:", zeroStarGenres);
  console.log("Rated genres:", ratedGenres);

  // If any genre has a 0-star rating, severely penalize the score
  if (hasAnyZeroStars) {
    const zeroPenalty = -10000000;
    score += zeroPenalty;
    details.push(`Zero-star genre penalty: ${zeroPenalty} (${zeroStarGenres.join(", ")})`);
    return { score, details, isRecommended: false };
  }

  // If no genres are rated at all, give a low base score
  if (!hasAnyRatedGenres && !hasLikedArtist) {
    const unratedScore = -5000000;
    score += unratedScore;
    details.push(`No rated genres penalty: ${unratedScore}`);
    return { score, details, isRecommended: false };
  }

  // Base score from highest preference (ensures 5-star genres are always above 4-star, etc.)
  if (maxPreferenceScore > 0) {
    const baseScore = maxPreferenceScore * 100000; // Reduced multiplier
    score += baseScore;
    details.push(`Base score from ${maxPreferenceScore}-star genre: ${baseScore}`);
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
      }
    });
  }

  // Small recency bonus (won't override genre preferences)
  if (release.release_date) {
    const daysOld =
      (Date.now() - new Date(release.release_date).getTime()) /
      (1000 * 60 * 60 * 24);
    const recencyBonus = Math.max(0, 10); // Small fixed bonus for recent releases
    score += recencyBonus;
    details.push(`Recency bonus: +${recencyBonus.toFixed(2)}`);
  }

  console.log("Final score:", score);
  console.log("Details:", details);

  return {
    score,
    details,
    isRecommended: hasLikedArtist || (!hasAnyZeroStars && hasAnyRatedGenres && score > 1000000)
  };
}

export function useReleaseSorting() {
  const { preferences } = useGenrePreferences();
  const { genreGroups } = useGenreGroups();
  const { releases: likedReleases } = useLikedReleases();

  // Create a map of genre preferences from liked releases
  const genrePreferences = useMemo(() => {
    const prefs = new Map<string, number>();
    
    // Guard against undefined likedReleases
    if (!likedReleases) return prefs;
    
    likedReleases.forEach(release => {
      // Add artist preferences
      release.artists?.forEach(({ artist }) => {
        prefs.set(`artist:${artist.id}`, (prefs.get(`artist:${artist.id}`) || 0) + 1);
      });
      
      // Add genre preferences
      release.genres?.forEach(genre => {
        prefs.set(genre, (prefs.get(genre) || 0) + 1);
      });
    });
    
    return prefs;
  }, [likedReleases]);

  const sortReleases = useCallback(
    (releases: Release[]) => {
      if (!releases?.length) return [];
      
      // Calculate scores for all releases
      const scoredReleases = releases.map(release => ({
        release,
        ...calculateReleaseScore(release, preferences || {}, genreGroups || {}, genrePreferences)
      }));

      // Calculate the score threshold for top 0.5% (much more selective)
      const validScores = scoredReleases
        .map(r => r.score)
        .filter(score => score > -Infinity && score >= 0);
      const recommendationThreshold = validScores.length > 0
        ? validScores[Math.floor(validScores.length * 0.995)] // Changed from 0.98 to 0.995
        : 0;

      // Only recommend if score is REALLY high or has multiple liked artists
      scoredReleases.forEach(scored => {
        const hasMultipleLikedArtists = scored.release.artists?.filter(
          ({ artist }) => genrePreferences.has(`artist:${artist.id}`)
        ).length >= 2;

        scored.isRecommended = 
          hasMultipleLikedArtists || // Has 2+ liked artists
          scored.score >= recommendationThreshold; // In top 0.5%
      });

      // Sort by score
      return scoredReleases
        .sort((a, b) => b.score - a.score)
        .map(({ release, score, details, isRecommended }) => ({
          ...release,
          _score: score,
          _scoreDetails: details,
          isRecommended
        }));
    },
    [preferences, genreGroups, genrePreferences]
  );

  return { sortReleases };
}
