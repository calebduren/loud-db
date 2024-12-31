import React from 'react';
import { useGenrePreferences } from '../../../hooks/settings/useGenrePreferences';
import { GenrePreferenceRating } from './GenrePreferenceRating';
import { LoadingSpinner } from '../../LoadingSpinner';

export function GenrePreferences() {
  const { 
    genreGroups, 
    preferences,
    updatePreference,
    loading 
  } = useGenrePreferences();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <p className="text-white/60">
        Rate each genre to help us personalize your music recommendations.
        More stars mean you like that genre more!
      </p>

      <div className="space-y-4">
        {Object.entries(genreGroups).map(([groupName, genres]) => (
          <GenrePreferenceRating
            key={groupName}
            name={groupName}
            genres={genres}
            value={preferences[groupName] || 0}
            onChange={(value) => updatePreference(groupName, value)}
          />
        ))}
      </div>
    </div>
  );
}