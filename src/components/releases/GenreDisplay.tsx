import React from 'react';

interface GenreDisplayProps {
  genres: string[];
}

export function GenreDisplay({ genres }: GenreDisplayProps) {
  if (!genres?.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {genres.map(genre => (
        <span
          key={genre}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80"
        >
          {genre}
        </span>
      ))}
    </div>
  );
}