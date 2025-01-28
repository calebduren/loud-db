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
        const data = await cache.get(
          cacheKey,
          async () => {
            // Add a delay before fetching to allow database to become consistent
            await new Promise(resolve => setTimeout(resolve, 500));

            let query = supabase.from("releases").select(
              `
            id,
            name,
            release_type,
            cover_url,
            genres,
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
              if (genreFilterMode === "include") {
                // Use overlap operator to match ANY of the genres
                query = query.overlaps("genres", allGenres);
              } else {
                // For exclude mode, filter out any releases that contain any of the genres
                allGenres.forEach((genre) => {
                  query = query.not('genres', 'cs', `{${genre}}`);
                });
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

            const { data, count, error } = await query;

            if (error) throw error;

            console.log("Release data from Supabase:", data?.[0]);
            return { releases: data || [], total: count || 0 };
          },
          { ttl: 5 * 60 * 1000 }
        ); // Cache for 5 minutes

        if (options.force) {
          await cache.delete(cacheKey);
        }

        const sortedReleases = sortReleases(data.releases);
        
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
    const init = async () => {
      setLoading(true);
      // Add a delay before the initial fetch
      await new Promise(resolve => setTimeout(resolve, 500));
      fetchReleases(0, false, { force: true });
    };
    init();

    // Listen for refresh events
    const handleRefresh = () => {
      fetchReleases(0, false, { force: true });
    };

    window.addEventListener('refreshReleases', handleRefresh);
    return () => window.removeEventListener('refreshReleases', handleRefresh);
  }, [fetchReleases]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    fetchReleases(releases.length, true);
  }, [fetchReleases, hasMore, loading, releases.length]);

  const loadMoreRef = useCallback((node: HTMLElement | null) => {
    if (node && hasMore && !loading) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMore();
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(node);
      return () => observer.disconnect();
    }
  }, [hasMore, loading, loadMore]);

  // Expose cache invalidation for manual refreshes
  const backgroundRefetch = useCallback(async () => {
    invalidateCache();
    await fetchReleases(0, false, { force: true });
  }, [fetchReleases, invalidateCache]);

  return {
    releases,
    loading,
    hasMore,
    loadMore,
    totalCount,
    loadMoreRef,
    addReleaseOptimistically,
    updateReleaseOptimistically,
    backgroundRefetch,
  };
}
