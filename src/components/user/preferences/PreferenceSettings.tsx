import React from 'react';
import { Tags } from 'lucide-react';
import { GenrePreferences } from './GenrePreferences';
import { SpotifySettings } from './SpotifySettings';

export function PreferenceSettings() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-8">Preferences</h1>
      
      <div className="space-y-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Tags className="w-5 h-5" />
            Genre Preferences
          </h2>
          <GenrePreferences />
        </div>

        <SpotifySettings />
      </div>
    </div>
  );
}