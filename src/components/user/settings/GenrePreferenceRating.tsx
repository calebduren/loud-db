import React from "react";
import { RatingSlider } from "../../ui/RatingSlider";

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
    <div className="space-y-4">
      <p className="font-medium text-lg">{name}</p>
      <RatingSlider value={value} onChange={onChange} />
      <div className="mb-2 flex flex-wrap gap-1.5">
        {genres.slice(0, 12).map((genre) => (
          <span key={genre} className="pill pill--genre">
            {genre}
          </span>
        ))}
        {genres.length > 12 && (
          <span className="pill pill--default">+{genres.length - 12} more</span>
        )}
      </div>
    </div>
  );
}
