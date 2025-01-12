import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Release, ReleaseType } from "../types/database";
import { useToast } from "./useToast";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
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
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { showToast } = useToast();

  const fetchWithRetry = async (
    fn: () => Promise<any>,
    retries = MAX_RETRIES
  ): Promise<any> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(fn, retries - 1);
      }
      throw error;
    }
  };

  const fetchReleasesFromDB = async (startRange: number, endRange: number) => {
    let query = supabase
      .from("releases_view")
      .select("*", { count: "exact" })
      .order("release_date", { ascending: false });

    // Apply type filter if not "all"
    if (!selectedTypes.includes("all")) {
      console.log("Applying type filter:", { selectedTypes });
      query = query.in("release_type", selectedTypes);
    }

    // Apply genre filter
    if (selectedGenres.length > 0) {
      const allGenres = selectedGenres.flatMap(
        (groupName) => genreGroups[groupName] || []
      );
      if (allGenres.length > 0) {
        if (genreFilterMode === "include") {
          // Include mode: match releases that have any of the selected genres
          query = query.overlaps("genres", allGenres);
        } else {
          // Exclude mode: match releases that don't have any of the selected genres
          // Use not + overlaps to exclude any releases that have any of the selected genres
          query = query.not("genres", "ov", `{${allGenres.join(",")}}`);
        }
      }
    }

    const { data, error, count } = await query
      .range(startRange, endRange)
      .throwOnError();

    if (error) throw error;

    return { data, count };
  };

  const fetchReleases = useCallback(
    async (isLoadMore = false) => {
      try {
        // Only set loading on initial fetch when no releases exist
        if (!isLoadMore && releases.length === 0) {
          setLoading(true);
        }

        const pageSize = isLoadMore ? SUBSEQUENT_PAGE_SIZE : INITIAL_PAGE_SIZE;
        const startRange = isLoadMore ? releases.length : 0;
        const endRange = startRange + pageSize - 1;

        console.log("Fetching releases with params:", {
          selectedTypes,
          selectedGenres,
          genreFilterMode,
          allGenres: selectedGenres.flatMap(
            (groupName) => genreGroups[groupName] || []
          ),
          startRange,
          endRange,
          isLoadMore,
        });

        const { data, count } = await fetchWithRetry(() =>
          fetchReleasesFromDB(startRange, endRange)
        );

        console.log("Query results:", {
          count,
          resultsLength: data?.length || 0,
          hasMore:
            (data?.length || 0) === pageSize &&
            startRange + pageSize < (count || 0),
        });

        // Batch all state updates in a single animation frame
        requestAnimationFrame(() => {
          if (isLoadMore) {
            setReleases((prev) => [...prev, ...(data || [])]);
          } else {
            setReleases(data || []);
          }

          if (count !== null) {
            setTotalCount(count);
            setHasMore(
              (data?.length || 0) === pageSize && startRange + pageSize < count
            );
          }

          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching releases:", error);
        showToast({
          title: "Error loading releases",
          description: "Please try again later",
          type: "error",
        });
      }
    },
    [
      releases.length,
      selectedTypes,
      selectedGenres,
      genreFilterMode,
      genreGroups,
      showToast,
    ]
  );

  const handleLoadMore = useCallback(async () => {
    console.log('handleLoadMore called:', { loading, hasMore, currentCount: releases.length });
    
    if (loading || !hasMore) {
      console.log('Aborting loadMore due to:', { loading, hasMore });
      return;
    }

    setLoading(true);
    try {
      const pageSize = SUBSEQUENT_PAGE_SIZE;
      const startRange = releases.length;
      const endRange = startRange + pageSize - 1;

      console.log('Fetching more releases:', { startRange, endRange, pageSize });
      
      const { data: newReleases, count } = await fetchWithRetry(() =>
        fetchReleasesFromDB(startRange, endRange)
      );

      console.log('Got new releases:', { 
        newReleasesCount: newReleases?.length, 
        totalCount: count,
        currentCount: releases.length 
      });

      if (newReleases?.length) {
        setReleases(prev => [...prev, ...newReleases]);
        if (count !== null) {
          setTotalCount(count);
          const newHasMore = releases.length + newReleases.length < count;
          console.log('Setting hasMore:', newHasMore);
          setHasMore(newHasMore);
        }
      } else {
        console.log('No new releases received, setting hasMore to false');
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more releases:', error);
      showToast({
        title: 'Error loading releases',
        description: 'Please try again later',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, releases.length, showToast]);

  // Initial load
  useEffect(() => {
    // Skip if we already have releases loaded
    if (releases.length > 0) {
      console.log('Skipping initial load, already have releases:', releases.length);
      return;
    }

    console.log('Running initial load');
    fetchReleases();
  }, [fetchReleases]);

  // Handle auth state changes
  useEffect(() => {
    // Only refetch if we don't have any releases
    if (releases.length === 0) {
      console.log('Auth state changed, no releases loaded - fetching');
      fetchReleases();
    } else {
      console.log('Auth state changed, keeping existing releases:', releases.length);
    }
  }, [selectedTypes, selectedGenres, genreFilterMode, genreGroups]);

  // Add optimistic update functions
  const addReleaseOptimistically = useCallback((release: Release) => {
    setReleases((prev) => {
      const newReleases = [release, ...prev];
      // Update total count
      setTotalCount((prev) => prev + 1);
      return newReleases;
    });
  }, []);

  const updateReleaseOptimistically = useCallback((updatedRelease: Release) => {
    setReleases((prev) => {
      const newReleases = prev.map((r) =>
        r.id === updatedRelease.id ? updatedRelease : r
      );
      return newReleases;
    });
  }, []);

  const backgroundRefetch = useCallback(async () => {
    try {
      const { data: newReleases, count } = await fetchWithRetry(() =>
        fetchReleasesFromDB(0, INITIAL_PAGE_SIZE)
      );

      if (newReleases) {
        setReleases((prev) => {
          // Merge optimistic updates with new data
          const merged = [...newReleases];
          prev.forEach((oldRelease) => {
            if (!merged.find((r) => r.id === oldRelease.id)) {
              merged.push(oldRelease);
            }
          });
          return merged;
        });

        if (count !== null) {
          setTotalCount(count);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in background refetch:", error);
    }
  }, []);

  return {
    releases,
    loading,
    hasMore,
    totalCount,
    loadMore: handleLoadMore,
    addReleaseOptimistically,
    updateReleaseOptimistically,
    backgroundRefetch,
  };
}
