import React from 'react';
import { StarRating } from '../../ui/StarRating';

interface GenrePreferenceRatingProps {
  name: string;
  genres: string[];
  value: number;
  onChange: (value: number) => void;
}

export function GenrePreferenceRating({
  name,
  genres,
  value,
  onChange
}: GenrePreferenceRatingProps) {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-white/60">
          {genres.slice(0, 3).join(', ')}
          {genres.length > 3 && ` and ${genres.length - 3} more`}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <StarRating value={value} onChange={onChange} />
        <span className="text-sm text-white/60">
          {value === 0 ? 'Not for me' : value === 5 ? 'Love this' : ''}
        </span>
      </div>
    </div>
  );
}