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
        <h4 className="font-medium">{name}</h4>
        <p className="mt-1 text-sm text-white/60">
          {genres.slice(0, 3).join(", ")}
          {genres.length > 3 && ` and ${genres.length - 3} more`}
        </p>
      </div>
      <StarRating value={value} onChange={onChange} />
    </div>
  );
}
