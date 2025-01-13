import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { Release, ReleaseType } from "../types/database";
import { useToast } from "./useToast";
import { useReleaseSorting } from "./useReleaseSorting";
import { useAuth } from "../contexts/AuthContext";
import { cache } from "../lib/cache";

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
  const { user } = useAuth();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { showToast } = useToast();
  const { sortReleases } = useReleaseSorting();

  // Memoize query parameters to prevent unnecessary refetches
  const queryParams = useMemo(() => ({
    selectedTypes,
    selectedGenres,
    genreFilterMode,
    genreGroups,
    userId: user?.id
  }), [selectedTypes, selectedGenres, genreFilterMode, genreGroups, user?.id]);

  const fetchReleases = useCallback(async (start = 0, loadMore = false) => {
    const cacheKey = `releases:${JSON.stringify(queryParams)}:${start}`;
    
    try {
      const data = await cache.get(cacheKey, async () => {
        let query = supabase
          .from("releases")
          .select(`
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
            artists:release_artists!release_id(
              artist:artists!artist_id(
                name
              )
            )
          `, { count: "exact" });

        // Apply filters
        if (selectedTypes[0] !== "all") {
          query = query.in("type", selectedTypes);
        }

        if (selectedGenres.length > 0) {
          if (genreFilterMode === "include") {
            const allGenres = selectedGenres.flatMap(group => genreGroups[group] || [group]);
            query = query.contains("genres", allGenres);
          } else {
            const excludedGenres = selectedGenres.flatMap(group => genreGroups[group] || [group]);
            query = query.not("genres", "cs", `{${excludedGenres.join(",")}}`);
          }
        }

        // Add pagination
        query = query
          .range(start, start + (loadMore ? SUBSEQUENT_PAGE_SIZE : INITIAL_PAGE_SIZE) - 1)
          .order("created_at", { ascending: false });

        const { data, count, error } = await query;
        
        if (error) throw error;
        
        console.log('Release data from Supabase:', data?.[0]);
        return { releases: data || [], total: count || 0 };
      }, { ttl: 5 * 60 * 1000 }); // Cache for 5 minutes

      if (!loadMore) {
        setReleases(data.releases);
      } else {
        setReleases(prev => [...prev, ...data.releases]);
      }
      
      setTotalCount(data.total);
      setHasMore(start + data.releases.length < data.total);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching releases:", error);
      showToast("Error loading releases", "error");
      setLoading(false);
    }
  }, [queryParams, showToast]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchReleases(0, false);
  }, [fetchReleases]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    fetchReleases(releases.length, true);
  }, [fetchReleases, hasMore, loading, releases.length]);

  return {
    releases,
    loading,
    hasMore,
    loadMore,
    totalCount
  };
}
