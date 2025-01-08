import React from "react";
import { useGenrePreferences } from "../../../hooks/settings/useGenrePreferences";
import { GenrePreferenceRating } from "./GenrePreferenceRating";
import { Button } from "../../ui/button";
import { LoadingSpinner } from "../../LoadingSpinner";

interface GenrePreferencesProps {
  onComplete?: () => void;
}

export function GenrePreferences({ onComplete }: GenrePreferencesProps) {
  const { genreGroups, preferences, updatePreference, loading } =
    useGenrePreferences();

  if (loading) {
    return (
      <div className="card">
        <LoadingSpinner />
      </div>
    );
  }

  const handleComplete = () => {
    onComplete?.();
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        Genre Preferences
      </h2>

      <div className="space-y-6">
        <p className="text-white/60">
          Rate each genre to help us personalize your music recommendations.
          More stars mean you like that genre more!
        </p>

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
    </div>
  );
}
