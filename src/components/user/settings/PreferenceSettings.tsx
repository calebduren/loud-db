import React from 'react';
import { GenrePreferences } from './GenrePreferences';
import { SpotifyConnection } from './SpotifyConnection';

export function PreferenceSettings() {
  return (
    <div className="space-y-8">
      <SpotifyConnection />
      <GenrePreferences />
      {/* Add other preference settings here in the future */}
    </div>
  );
}