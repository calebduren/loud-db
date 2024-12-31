import { useState, useMemo, useCallback } from 'react';
import { Release, ReleaseType } from '../types/database';
import { useGenreGroups } from './useGenreGroups';

export function useReleaseFilters(releases: Release[]) {
  const [selectedType, setSelectedType] = useState<ReleaseType | 'all'>('all');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const { genreGroups } = useGenreGroups();

  // Only show genre groups as available filters
  const availableGenres = useMemo(() => {
    return Object.keys(genreGroups).sort();
  }, [genreGroups]);

  // Memoize filtered releases
  const filteredReleases = useMemo(() => {
    if (selectedType === 'all' && selectedGenres.length === 0) {
      return releases;
    }

    return releases.filter(release => {
      // Filter by type
      if (selectedType !== 'all' && release.release_type !== selectedType) {
        return false;
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
  }, [releases, selectedType, selectedGenres, genreGroups]);

  const handleTypeChange = useCallback((type: ReleaseType | 'all') => {
    setSelectedType(type);
  }, []);

  const handleGenreChange = useCallback((genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  }, []);

  return {
    selectedType,
    selectedGenres,
    availableGenres,
    filteredReleases,
    handleTypeChange,
    handleGenreChange
  };
}