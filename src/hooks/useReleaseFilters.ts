import { useCallback, useRef, useState, useEffect } from 'react';
import { ReleaseType } from '../types/database';
import { useGenreGroups } from './useGenreGroups';
import { useReleases } from './useReleases';
import { usePersistedState } from './usePersistedState';
import { useToast } from './useToast';

export function useReleaseFilters() {
  const [selectedTypes, setSelectedTypes] = usePersistedState<(ReleaseType | 'all')[]>(
    'louddb:selectedTypes',
    ['all']
  );
  const [selectedGenres, setSelectedGenres] = usePersistedState<string[]>(
    'louddb:selectedGenres',
    []
  );
  const [genreFilterMode, setGenreFilterMode] = usePersistedState<'include' | 'exclude'>(
    'louddb:genreFilterMode',
    'include'
  );
  const { genreGroups } = useGenreGroups();
  const { showToast } = useToast();

  // Only show genre groups as available filters
  const availableGenres = Object.keys(genreGroups).sort();

  const {
    releases: filteredReleases,
    loading,
    hasMore,
    totalCount,
    loadMore,
    loadMoreRef,
    addReleaseOptimistically,
    updateReleaseOptimistically,
    backgroundRefetch
  } = useReleases({
    selectedTypes,
    selectedGenres,
    genreFilterMode,
    genreGroups,
  });

  const handleTypeChange = useCallback((type: ReleaseType | 'all') => {
    setSelectedTypes(prev => {
      if (type === 'all') {
        return ['all'];
      }
      
      const newTypes = prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev.filter(t => t !== 'all'), type];
        
      return newTypes.length === 0 ? ['all'] : newTypes;
    });
  }, [setSelectedTypes]);

  const handleGenreChange = useCallback((genres: string[]) => {
    setSelectedGenres(genres);
  }, [setSelectedGenres]);

  const handleGenreFilterModeChange = useCallback((mode: 'include' | 'exclude') => {
    setGenreFilterMode(mode);
  }, [setGenreFilterMode]);

  return {
    selectedTypes,
    selectedGenres,
    genreFilterMode,
    availableGenres,
    filteredReleases,
    loading,
    hasMore,
    totalCount,
    loadMoreRef,
    loadMore,
    handleTypeChange,
    handleGenreChange,
    handleGenreFilterModeChange,
    addReleaseOptimistically,
    updateReleaseOptimistically,
    backgroundRefetch
  };
}