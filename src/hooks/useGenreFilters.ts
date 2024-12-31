import { useState, useEffect, useMemo } from 'react';
import { Release } from '../types/database';
import { getGenreGroups, getGenreMappings } from '../lib/genres/genreMapping';

export function useGenreFilters(releases: Release[]) {
  const [genreGroups, setGenreGroups] = useState<Record<string, string[]>>({});
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch genre groups and mappings
  useEffect(() => {
    async function fetchGenreMappings() {
      try {
        const [groups, mappings] = await Promise.all([
          getGenreGroups(),
          getGenreMappings()
        ]);

        // Create mapping of group names to genres
        const groupMap: Record<string, string[]> = {};
        groups.forEach(group => {
          groupMap[group.name] = mappings
            .filter(m => m.group_id === group.id)
            .map(m => m.genre);
        });

        setGenreGroups(groupMap);
      } catch (error) {
        console.error('Error fetching genre mappings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGenreMappings();
  }, []);

  // Get all unique genres from releases
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    releases.forEach(release => {
      release.genres.forEach(genre => {
        // Check if genre belongs to a group
        let added = false;
        for (const [groupName, groupGenres] of Object.entries(genreGroups)) {
          if (groupGenres.includes(genre)) {
            genres.add(groupName);
            added = true;
            break;
          }
        }
        // If genre doesn't belong to a group, add it directly
        if (!added) {
          genres.add(genre);
        }
      });
    });
    return Array.from(genres).sort();
  }, [releases, genreGroups]);

  // Filter releases based on selected genres
  const filteredReleases = useMemo(() => {
    if (selectedGenres.length === 0) return releases;

    return releases.filter(release => {
      return selectedGenres.some(selectedGenre => {
        // If selected genre is a group name
        if (genreGroups[selectedGenre]) {
          return release.genres.some(genre => 
            genreGroups[selectedGenre].includes(genre)
          );
        }
        // If selected genre is a direct genre
        return release.genres.includes(selectedGenre);
      });
    });
  }, [releases, selectedGenres, genreGroups]);

  const handleGenreChange = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  return {
    availableGenres,
    selectedGenres,
    filteredReleases,
    handleGenreChange,
    loading
  };
}