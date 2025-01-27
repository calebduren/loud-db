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
    <div className="space-y-8 card">
      <div>
        <p className="font-semibold text-xl">{name}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {genres.slice(0, 12).map((genre) => (
            <span key={genre} className="pill pill--outline">
              {genre}
            </span>
          ))}
          {genres.length > 12 && (
            <span className="pill pill--outline">
              +{genres.length - 12} more
            </span>
          )}
        </div>
      </div>
      <RatingSlider value={value} onChange={onChange} />
    </div>
  );
}
