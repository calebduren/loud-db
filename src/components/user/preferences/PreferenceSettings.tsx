import React from 'react';
import { Tags } from 'lucide-react';
import { GenrePreferences } from './GenrePreferences';
import { SpotifySettings } from './SpotifySettings';
import { PageTitle } from '../../layout/PageTitle';

export function PreferenceSettings() {
  return (
    <div>
      <PageTitle 
        title="Preferences" 
        subtitle="Customize your music discovery experience"
      />
      
      <div className="max-w-2xl space-y-8">
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