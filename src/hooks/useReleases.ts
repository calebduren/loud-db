import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { Release, ReleaseType } from "../types/database";
import { useToast } from "./useToast";
import { useReleaseSorting } from "./useReleaseSorting";
import { useAuth } from "../contexts/AuthContext";
import { cache } from "../lib/cache";

const INITIAL_PAGE_SIZE = 150;
const SUBSEQUENT_PAGE_SIZE = 100;

interface UseReleasesParams {
  selectedTypes?: (ReleaseType | "all")[];
  selectedGenres?: string[];
  genreFilterMode?: "include" | "exclude";
  genreGroups?: Record<string, string[]>;
}

export function useReleases({
  selectedTypes = ["all"],
  selectedGenres = [],
  genreFilterMode = "include",
  genreGroups = {},
}: UseReleasesParams = {}) {
  const { user } = useAuth();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { showToast } = useToast();
  const { sortReleases } = useReleaseSorting();

  // Memoize query parameters to prevent unnecessary refetches
  const queryParams = useMemo(
    () => ({
      selectedTypes,
      selectedGenres,
      genreFilterMode,
      genreGroups,
      userId: user?.id,
    }),
    [selectedTypes, selectedGenres, genreFilterMode, genreGroups, user?.id]
  );

  const fetchReleases = useCallback(
    async (start = 0, loadMore = false, options: { force?: boolean } = {}) => {
      const cacheKey = `releases:${JSON.stringify(queryParams)}:${start}`;

      try {
        console.log('Fetching releases with params:', {
          start,
          loadMore,
          selectedTypes,
          selectedGenres,
          genreFilterMode,
          genreGroups
        });

        const data = await cache.get(
          cacheKey,
          async () => {
            let query = supabase.from("releases").select(
              `
            id,
            name,
            release_type,
            cover_url,
            genres,
            release_genres:release_genres(
              genre:genres(
                id,
                name
              )
            ),
            record_label,
            track_count,
            spotify_url,
            apple_music_url,
            created_at,
            updated_at,
            created_by,
            release_date,
            description,
            description_author_id,
            description_author:profiles!releases_description_author_id_fkey(id, username),
            artists:release_artists(
              position,
              artist:artists(
                id,
                name
              )
            ),
            tracks(
              id,
              name,
              track_number,
              duration_ms,
              preview_url,
              created_at
            )
          `,
              { count: "exact" }
            );

            // Apply filters
            if (selectedTypes[0] !== "all") {
              query = query.in("release_type", selectedTypes);
            }

            if (selectedGenres.length > 0) {
              const allGenres = selectedGenres.flatMap(
                (group) => genreGroups[group] || [group]
              );
              console.log('Filtering by genres:', allGenres);
              
              if (genreFilterMode === "include") {
                // Use release_genres to filter, but fall back to old genres array
                query = query.or(
                  `release_genres.genre.name.in.(${allGenres.map(g => `'${g}'`).join(',')}),genres.cs.{${allGenres.join(',')}}`,
                  { foreignTable: 'release_genres' }
                );
              } else {
                // For exclude mode, filter out releases with any of these genres
                query = query.not('genres', 'cs', `{${allGenres.join(',')}}`);
                query = query.not('release_genres.genre.name', 'in', `(${allGenres.map(g => `'${g}'`).join(',')})`, { foreignTable: 'release_genres' });
              }
            }

            // Add pagination
            query = query
              .range(
                start,
                start +
                  (loadMore ? SUBSEQUENT_PAGE_SIZE : INITIAL_PAGE_SIZE) -
                  1
              )
              .order("created_at", { ascending: false });

            console.log('Executing query...');
            const { data, count, error } = await query;
            console.log('Query results:', { 
              resultCount: data?.length || 0, 
              totalCount: count,
              error,
              firstResult: data?.[0]
            });

            if (error) throw error;

            return { releases: data || [], total: count || 0 };
          },
          { ttl: 5 * 60 * 1000 }
        );

        if (options.force) {
          await cache.delete(cacheKey);
        }

        const sortedReleases = sortReleases(data.releases);
        console.log('Sorted releases:', {
          count: sortedReleases.length,
          first: sortedReleases[0]
        });
        
        if (!loadMore) {
          setReleases(sortedReleases);
        } else {
          setReleases((prev) => [...prev, ...sortedReleases]);
        }

        setTotalCount(data.total);
        setHasMore(start + data.releases.length < data.total);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching releases:", error);
        let errorMessage = "Error loading releases";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "object" && error !== null) {
          // Handle Supabase error object
          const supabaseError = error as {
            message?: string;
            error?: { message?: string };
          };
          errorMessage =
            supabaseError.message ||
            supabaseError.error?.message ||
            errorMessage;
        }

        showToast({
          message: errorMessage,
          type: "error",
        });
        setLoading(false);
      }
    },
    [queryParams, showToast, sortReleases]
  );

  const invalidateCache = useCallback(() => {
    // Invalidate all release caches by deleting any key that starts with "releases:"
    const keys = cache.keys();
    keys.forEach(key => {
      if (key.startsWith('releases:')) {
        cache.delete(key);
      }
    });
  }, []);

  const addReleaseOptimistically = useCallback((release: Release) => {
    // Invalidate all release caches
    invalidateCache();
    
    setReleases(prev => {
      // Add the new release at the top and remove any duplicates
      const withoutDuplicate = prev.filter(r => r.id !== release.id);
      return [release, ...withoutDuplicate];
    });
    setTotalCount(prev => prev + 1);
  }, [invalidateCache]);

  const updateReleaseOptimistically = useCallback((release: Release) => {
    // Invalidate all release caches
    invalidateCache();
    
    setReleases(prev => 
      prev.map(r => r.id === release.id ? release : r)
    );
  }, [invalidateCache]);

  // Initial load
  useEffect(() => {
    console.log('Initial load effect triggered');
    fetchReleases(0, false, { force: true });
  }, [fetchReleases]);

  return {
    releases,
    loading,
    hasMore,
    totalCount,
    fetchMore: (start: number) => fetchReleases(start, true),
    invalidateCache,
    addReleaseOptimistically,
  };
}
