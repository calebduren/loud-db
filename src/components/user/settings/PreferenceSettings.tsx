import React from "react";
import { GenrePreferences } from "./GenrePreferences";

export function PreferenceSettings() {
  return (
    <div className="space-y-8">
      <GenrePreferences />
      {/* Add other preference settings here in the future */}
    </div>
  );
}
