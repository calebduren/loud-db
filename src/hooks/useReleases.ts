import { useCallback, useEffect, useRef, useState } from "react";
import { Release, ReleaseType } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { useAuth } from "../contexts/AuthContext";

const INITIAL_PAGE_SIZE = 20;
const SUBSEQUENT_PAGE_SIZE = 10;

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
  const initialFetchRef = useRef(false);

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

      // First, get the total count with a simpler query
      const countQuery = supabase
        .from("releases")
        .select("id", { count: "exact" });

      // Apply filters to count query
      if (selectedTypes && selectedTypes.length > 0 && selectedTypes[0] !== "all") {
        countQuery.in("release_type", selectedTypes);
      }

      if (selectedGenres && selectedGenres.length > 0) {
        if (genreFilterMode === "include") {
          countQuery.or(
            selectedGenres.map(genre => 
              `release_genres.genres.name.eq.${genre}`
            ).join(',')
          );
        } else {
          selectedGenres.forEach(genre => {
            countQuery.not('release_genres.genres.name', 'eq', genre);
          });
        }
      }
      
      const { count: totalCount, error: countError } = await countQuery;
      
      if (countError) {
        console.error("[useReleases] Count query error:", countError);
        throw countError;
      }

      console.log("[useReleases] Count result:", { totalCount });

      // Now build the data query
      const pageSize = loadMore ? SUBSEQUENT_PAGE_SIZE : INITIAL_PAGE_SIZE;
      console.log("[useReleases] Pagination params:", {
        start,
        pageSize,
        loadMore,
        range: `${start} to ${start + pageSize - 1}`
      });

      const dataQuery = supabase
        .from("releases")
        .select(`
          id,
          name,
          release_type,
          cover_url,
          record_label,
          track_count,
          release_date,
          spotify_url,
          apple_music_url,
          created_at,
          created_by,
          release_artists (
            position,
            artists (
              id,
              name
            )
          ),
          release_genres (
            genres (
              name
            )
          )
        `)
        .order("created_at", { ascending: false })
        .range(start, start + pageSize - 1);

      // Apply filters to data query
      if (selectedTypes && selectedTypes.length > 0 && selectedTypes[0] !== "all") {
        dataQuery.in("release_type", selectedTypes);
      }

      if (selectedGenres && selectedGenres.length > 0) {
        if (genreFilterMode === "include") {
          dataQuery.or(
            selectedGenres.map(genre => 
              `release_genres.genres.name.eq.${genre}`
            ).join(',')
          );
        } else {
          selectedGenres.forEach(genre => {
            dataQuery.not('release_genres.genres.name', 'eq', genre);
          });
        }
      }

      const { data, error: dataError } = await dataQuery;

      if (dataError) {
        console.error("[useReleases] Data query error:", dataError);
        throw dataError;
      }

      console.log("[useReleases] Raw data:", {
        count: data?.length || 0,
        sample: data?.[0]
      });

      const transformedReleases = data?.map((release) => {
        const artists = release.release_artists
          ?.sort((a, b) => (a.position || 0) - (b.position || 0))
          ?.map((ra) => ({
            position: ra.position || 0,
            artist: ra.artists
          })) || [];

        const genres = [
          ...(release.release_genres?.map((rg) => rg.genres?.name).filter(Boolean) || [])
        ];

        return {
          id: release.id,
          name: release.name || "",
          artists,
          genres: [...new Set(genres)],
          release_type: release.release_type || "Album",
          cover_url: release.cover_url || null,
          record_label: release.record_label || null,
          track_count: release.track_count || 0,
          release_date: release.release_date || null,
          spotify_url: release.spotify_url || null,
          apple_music_url: release.apple_music_url || null,
          created_at: release.created_at,
          created_by: release.created_by
        };
      }) || [];

      console.log("[useReleases] Transformed releases:", {
        count: transformedReleases.length,
        sample: transformedReleases[0]
      });

      setCount(totalCount || 0);
      if (!loadMore) {
        setReleases(transformedReleases);
      } else {
        setReleases((prev) => [...prev, ...transformedReleases]);
      }
      setError(null);
    } catch (err) {
      console.error("[useReleases] Error fetching releases:", err);
      setError(err as Error);
      setReleases([]);
      setCount(0);
    } finally {
      setLoading(false);
      initialFetchRef.current = true;
    }
  }, [selectedTypes, selectedGenres, genreFilterMode]);

  useEffect(() => {
    console.log("[useReleases] Effect triggered", {
      initialFetch: initialFetchRef.current,
      filters: {
        types: selectedTypes,
        genres: selectedGenres,
        mode: genreFilterMode
      }
    });
    
    fetchReleases();
  }, [fetchReleases, selectedTypes, selectedGenres, genreFilterMode]);

  const loadMoreReleases = useCallback(() => {
    if (!loading) {
      fetchReleases(releases.length, true);
    }
  }, [loading, fetchReleases, releases.length]);

  return {
    releases,
    count,
    error,
    loading,
    loadMore: loadMoreReleases,
    backgroundRefetch: fetchReleases
  };
}
