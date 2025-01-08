import { useCallback } from 'react';
import { ReleaseType } from '../types/database';
import { useGenreGroups } from './useGenreGroups';
import { useReleases } from './useReleases';
import { usePersistedState } from './usePersistedState';

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

  // Only show genre groups as available filters
  const availableGenres = Object.keys(genreGroups).sort();

  const {
    releases: filteredReleases,
    loading,
    hasMore,
    totalCount,
    loadMoreRef,
    refetch,
    loadMore,
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

  const handleGenreChange = useCallback((genre: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      }
      return [...prev, genre];
    });
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
    refetch,
    loadMore,
    handleTypeChange,
    handleGenreChange,
    handleGenreFilterModeChange,
  };
}