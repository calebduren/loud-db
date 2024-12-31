import React from 'react';
import { useReleases } from '../../hooks/useReleases';
import { WeeklyReleaseList } from '../releases/WeeklyReleaseList';
import { ReleaseFilters } from '../filters/ReleaseFilters';
import { useReleaseFilters } from '../../hooks/useReleaseFilters';

export function AllReleases() {
  const { releases, loading } = useReleases();
  const {
    selectedType,
    selectedGenres,
    availableGenres,
    filteredReleases,
    handleTypeChange,
    handleGenreChange,
  } = useReleaseFilters(releases);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Latest Releases</h1>
      
      <ReleaseFilters
        selectedType={selectedType}
        selectedGenres={selectedGenres}
        availableGenres={availableGenres}
        onTypeChange={handleTypeChange}
        onGenreChange={handleGenreChange}
      />

      {filteredReleases.length === 0 ? (
        <p className="text-white/60">No releases found.</p>
      ) : (
        <WeeklyReleaseList releases={filteredReleases} />
      )}
    </div>
  );
}