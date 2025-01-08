import React from "react";
import { useGenrePreferences } from "../../../hooks/settings/useGenrePreferences";
import { GenrePreferenceRating } from "./GenrePreferenceRating";
import { Button } from "../../ui/button";
import { LoadingSpinner } from "../../LoadingSpinner";
import { PageTitle } from "../../layout/PageTitle";

interface GenrePreferencesProps {
  onComplete?: () => void;
}

export function GenrePreferences({ onComplete }: GenrePreferencesProps) {
  const { genreGroups, preferences, updatePreference, loading } =
    useGenrePreferences();

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleComplete = () => {
    onComplete?.();
  };

  return (
    <>
      <PageTitle
        title="Genre Preferences"
        subtitle="Rate each genre to help us personalize your music recommendations"
      />

      <div className="space-y-6">
        <div className="space-y-8">
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

        {onComplete && (
          <div className="mt-8 flex justify-end">
            <Button onClick={handleComplete} size="lg">
              Continue
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
