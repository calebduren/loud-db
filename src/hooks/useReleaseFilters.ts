import { useCallback, useEffect } from "react";
import { ReleaseType } from "../types/database";
import { useGenreGroups } from "./useGenreGroups";
import { useReleases } from "./useReleases";
import { usePersistedState } from "./usePersistedState";

export function useReleaseFilters() {
  const [selectedTypes, setSelectedTypes] = usePersistedState<
    (ReleaseType | "all")[]
  >("louddb:selectedTypes", ["all"]);
  const [selectedGenres, setSelectedGenres] = usePersistedState<string[]>(
    "louddb:selectedGenres",
    []
  );
  const [genreFilterMode, setGenreFilterMode] = usePersistedState<
    "include" | "exclude"
  >("louddb:genreFilterMode", "include");
  const { genreGroups } = useGenreGroups();

  // Only show genre groups as available filters
  const availableGenres = Object.keys(genreGroups).sort();

  console.log('useReleaseFilters state:', {
    selectedTypes,
    selectedGenres,
    genreFilterMode,
    hasGenreGroups: Object.keys(genreGroups || {}).length > 0
  });

  const {
    releases,
    count: totalCount,
    error,
    loading: releasesLoading,
    loadMore: loadMoreReleases,
    backgroundRefetch: refetchReleases,
  } = useReleases({
    selectedTypes,
    selectedGenres,
    genreFilterMode,
  });

  useEffect(() => {
    console.log("[useReleaseFilters] Data updated:", {
      releasesCount: releases?.length || 0,
      totalCount,
      loading: releasesLoading,
      error,
      filters: {
        types: selectedTypes,
        genres: selectedGenres,
        mode: genreFilterMode
      }
    });
  }, [releases, totalCount, releasesLoading, error, selectedTypes, selectedGenres, genreFilterMode]);

  const handleTypeChange = useCallback((types: string[]) => {
    console.log("[useReleaseFilters] Type change:", types);
    setSelectedTypes(types);
  }, []);

  const handleGenreChange = useCallback((genres: string[]) => {
    console.log("[useReleaseFilters] Genre change:", genres);
    setSelectedGenres(genres);
  }, []);

  const handleGenreFilterModeChange = useCallback((mode: "include" | "exclude") => {
    console.log("[useReleaseFilters] Mode change:", mode);
    setGenreFilterMode(mode);
  }, []);

  return {
    selectedTypes,
    selectedGenres,
    genreFilterMode,
    releases,
    loading: releasesLoading,
    hasMore: (totalCount || 0) > (releases?.length || 0),
    totalCount,
    loadMore: loadMoreReleases,
    handleTypeChange,
    handleGenreChange,
    handleGenreFilterModeChange,
    backgroundRefetch: refetchReleases,
  };
}
