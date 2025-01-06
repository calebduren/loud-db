import { useState, useMemo, useCallback } from 'react';
import { Release, ReleaseType } from '../types/database';
import { useGenreGroups } from './useGenreGroups';

export function useReleaseFilters(releases: Release[]) {
  const [selectedTypes, setSelectedTypes] = useState<(ReleaseType | 'all')[]>(['all']);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const { genreGroups } = useGenreGroups();

  // Only show genre groups as available filters
  const availableGenres = useMemo(() => {
    return Object.keys(genreGroups).sort();
  }, [genreGroups]);

  // Memoize filtered releases
  const filteredReleases = useMemo(() => {
    if (selectedTypes.includes('all') && selectedGenres.length === 0) {
      return releases;
    }

    return releases.filter(release => {
      // Filter by type
      if (!selectedTypes.includes('all')) {
        const matchesType = selectedTypes.some(
          selectedType => release.release_type.toLowerCase() === selectedType.toLowerCase()
        );
        if (!matchesType) return false;
      }

      // Filter by genre groups
      if (selectedGenres.length > 0) {
        return selectedGenres.some(groupName => {
          const groupGenres = genreGroups[groupName] || [];
          return release.genres.some(genre => groupGenres.includes(genre));
        });
      }

      return true;
    });
  }, [releases, selectedTypes, selectedGenres, genreGroups]);

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
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  }, []);

  return {
    selectedTypes,
    selectedGenres,
    availableGenres,
    filteredReleases,
    handleTypeChange,
    handleGenreChange,
  };
}