import React from 'react';
import { GenreSelect } from './GenreSelect';

interface MappingFormProps {
  groupId: string;
  onSubmit: (genre: string, groupId: string) => Promise<void>;
  existingGenres?: string[];
}

export function MappingForm({ groupId, onSubmit, existingGenres = [] }: MappingFormProps) {
  const handleSubmit = async (genres: string[]) => {
    // Add each selected genre to the group
    await Promise.all(
      genres.map(genre => onSubmit(genre, groupId))
    );
  };

  return (
    <div className="mt-4">
      <GenreSelect onSubmit={handleSubmit} excludeGenres={existingGenres} />
    </div>
  );
}