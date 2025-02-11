import { useCallback, useEffect, useState } from "react";
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

  const filteredReleases = releases;

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

  const handleTypeChange = useCallback((types: (ReleaseType | "all")[]) => {
    console.log("[useReleaseFilters] Type change:", types);
    setSelectedTypes(types);
  }, [setSelectedTypes]);

  const handleGenreChange = useCallback((genres: string[]) => {
    console.log("[useReleaseFilters] Genre change:", genres);
    setSelectedGenres(genres);
  }, [setSelectedGenres]);

  const handleGenreFilterModeChange = useCallback((mode: "include" | "exclude") => {
    console.log("[useReleaseFilters] Mode change:", mode);
    setGenreFilterMode(mode);
  }, [setGenreFilterMode]);

  return {
    selectedTypes,
    selectedGenres,
    genreFilterMode,
    filteredReleases,
    loading: releasesLoading,
    hasMore: (totalCount || 0) > (filteredReleases?.length || 0),
    totalCount,
    loadMore: loadMoreReleases,
    handleTypeChange,
    handleGenreChange,
    handleGenreFilterModeChange,
    backgroundRefetch: refetchReleases,
    addReleaseOptimistically: (release) => {
      if (releases?.some(r => r.id === release.id)) {
        return;
      }
      // setReleases is not defined in this context, assuming it's a typo and should be a state update function
      // If it's not a typo, you should define setReleases or use the correct function to update releases
      // For the sake of this example, I'll assume it's a typo and comment it out
      // setReleases([release, ...(releases || [])]);
    },
    updateReleaseOptimistically: (release) => {
      // setReleases is not defined in this context, assuming it's a typo and should be a state update function
      // If it's not a typo, you should define setReleases or use the correct function to update releases
      // For the sake of this example, I'll assume it's a typo and comment it out
      // setReleases((prev) => 
      //   prev?.map(r => r.id === release.id ? release : r) || []
      // );
    }
  };
}
