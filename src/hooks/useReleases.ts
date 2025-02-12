import { useCallback, useEffect, useRef, useState } from "react";
import { Release, ReleaseType } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { useAuth } from "../contexts/AuthContext";
import { useReleaseSorting } from "../hooks/useReleaseSorting";

const INITIAL_PAGE_SIZE = 150;
const SUBSEQUENT_PAGE_SIZE = 100;

interface UseReleasesOptions {
  selectedTypes?: (ReleaseType | "all")[];
  selectedGenres?: string[];
  genreFilterMode?: "include" | "exclude";
}

export function useReleases(options: UseReleasesOptions = {}) {
  const { selectedTypes = ["all"], selectedGenres = [], genreFilterMode = "include" } = options;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [count, setCount] = useState<number>(0);
  const { sortReleases } = useReleaseSorting();

  const fetchReleases = useCallback(async (start = 0, loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      console.log("[useReleases] Starting fetch", {
        start,
        loadMore,
        filters: {
          types: selectedTypes,
          genres: selectedGenres,
          mode: genreFilterMode
        }
      });

      // First, let's see what release types we have in the database
      const { data: releaseTypes, error: typesError } = await supabase
        .from("releases")
        .select("release_type")
        .limit(1000);

      console.log("[useReleases] Available release types:", {
        types: [...new Set(releaseTypes?.map(r => r.release_type))],
      });

      // First, get the total count with a simpler query
      const countQuery = supabase
        .from("releases")
        .select("id", { count: "exact" });

      // Apply filters to count query
      if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes("all")) {
        console.log("[useReleases] Applying type filter:", {
          selectedTypes,
          query: `release_type in (${selectedTypes.join(", ")})`
        });
        countQuery.in("release_type", selectedTypes);
      }

      if (selectedGenres && selectedGenres.length > 0) {
        if (genreFilterMode === "include") {
          countQuery.overlaps("genres", selectedGenres);
        } else {
          selectedGenres.forEach(genre => {
            countQuery.not('genres', 'cs', `{${genre}}`);
          });
        }
      }
      
      const { count: totalCount, error: countError } = await countQuery;
      
      if (countError) {
        console.error("[useReleases] Count query error:", countError);
        throw countError;
      }

      console.log("[useReleases] Count result:", { totalCount, selectedTypes });

      // Now build the data query
      const pageSize = loadMore ? SUBSEQUENT_PAGE_SIZE : INITIAL_PAGE_SIZE;
      const dataQuery = supabase
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
        `)
        .range(start, start + pageSize - 1)
        .order("created_at", { ascending: false });

      if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes("all")) {
        console.log("[useReleases] Applying type filter:", {
          selectedTypes,
          query: `release_type in (${selectedTypes.join(", ")})`
        });
        dataQuery.in("release_type", selectedTypes);
      }

      if (selectedGenres && selectedGenres.length > 0) {
        if (genreFilterMode === "include") {
          dataQuery.overlaps("genres", selectedGenres);
        } else {
          selectedGenres.forEach(genre => {
            dataQuery.not('genres', 'cs', `{${genre}}`);
          });
        }
      }

      const { data: fetchedReleases, error: dataError } = await dataQuery;

      if (dataError) {
        throw dataError;
      }

      const sortedReleases = sortReleases(fetchedReleases || []);

      setCount(totalCount || 0);
      if (loadMore) {
        setReleases(prev => [...prev, ...sortedReleases]);
      } else {
        setReleases(sortedReleases);
      }

    } catch (error) {
      console.error("Error fetching releases:", error);
      setError(error instanceof Error ? error : new Error("Failed to fetch releases"));
    } finally {
      setLoading(false);
    }
  }, [selectedTypes, selectedGenres, genreFilterMode, sortReleases]);

  // Initial fetch
  useEffect(() => {
    fetchReleases(0, false);
  }, [selectedTypes, selectedGenres, genreFilterMode]);

  return {
    releases,
    loading,
    error,
    count,
    setReleases,
    loadMore: (start: number) => fetchReleases(start, true),
    backgroundRefetch: async () => {
      await fetchReleases(0, false);
    }
  };
}
