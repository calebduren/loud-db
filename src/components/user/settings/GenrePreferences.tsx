import React, { useState, useEffect } from "react";
import { useGenrePreferences } from "../../../hooks/settings/useGenrePreferences";
import { GenrePreferenceRating } from "./GenrePreferenceRating";
import { Button } from "../../ui/button";
import { LoadingSpinner } from "../../LoadingSpinner";
import { PageTitle } from "../../layout/PageTitle";
import { useDebouncedCallback } from "../../../hooks/useDebounce";

interface GenrePreferencesProps {
  onComplete?: () => void;
}

export function GenrePreferences({ onComplete }: GenrePreferencesProps) {
  const { genreGroups, preferences, updatePreference, loading } =
    useGenrePreferences();

  // Local state for immediate UI updates
  const [localPreferences, setLocalPreferences] =
    useState<Record<string, number>>(preferences);

  // Update local state when preferences change from the server
  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const debouncedUpdate = useDebouncedCallback(
    (groupName: string, value: number) => {
      updatePreference(groupName, value);
    },
    500
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  const handlePreferenceChange = (groupName: string, value: number) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [groupName]: value,
    }));
    debouncedUpdate(groupName, value);
  };

  const handleComplete = () => {
    onComplete?.();
  };

  return (
    <>
      <PageTitle
        title="Genre Preferences"
        subtitle="Rate each genre to help us personalize your music recommendations"
      />

      <div className="container--narrow">
        <div className="space-y-8">
          {Object.entries(genreGroups).map(([groupName, genres]) => (
            <GenrePreferenceRating
              key={groupName}
              name={groupName}
              genres={genres}
              value={localPreferences[groupName] || 0}
              onChange={(value) => handlePreferenceChange(groupName, value)}
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
