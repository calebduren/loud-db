import React from "react";
import { StarRating } from "../../ui/StarRating";

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
  onChange,
}: GenrePreferenceRatingProps) {
  return (
    <div className="space-y-2">
      <div>
        <p className="font-medium text-lg">{name}</p>
        <p className="mb-2 text-sm text-white/60">
          {genres.slice(0, 7).join(", ")}
          {genres.length > 7 && ` and ${genres.length - 7} more`}
        </p>
      </div>
      <StarRating value={value} onChange={onChange} />
    </div>
  );
}
