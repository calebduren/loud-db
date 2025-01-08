import { useState, useCallback } from 'react';
import { Release, ReleaseType } from '../types/database';
import { useGenreGroups } from './useGenreGroups';
import { useReleases } from './useReleases';

export function useReleaseFilters() {
  const [selectedTypes, setSelectedTypes] = useState<(ReleaseType | 'all')[]>(['all']);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
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
  }, []);

  const handleGenreChange = useCallback((genre: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      }
      return [...prev, genre];
    });
  }, []);

  return {
    selectedTypes,
    selectedGenres,
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
  };
}