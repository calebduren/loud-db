import React from "react";
import { ReleaseType } from "../../types/database";
import { FilterSection } from "./FilterSection";
import { FilterButton } from "./FilterButton";

const RELEASE_TYPES: (ReleaseType | "all")[] = [
  "all",
  "Single",
  "EP",
  "LP",
  "Compilation",
];

const SKELETON_GENRES = Array(8).fill(null); // For loading state

interface ReleaseFiltersProps {
  loading?: boolean;
  selectedTypes: (ReleaseType | "all")[];
  selectedGenres: string[];
  availableGenres: string[];
  onTypeChange: (type: ReleaseType | "all") => void;
  onGenreChange: (genre: string) => void;
}

export function ReleaseFilters({
  loading,
  selectedTypes,
  selectedGenres,
  availableGenres,
  onTypeChange,
  onGenreChange,
}: ReleaseFiltersProps) {
  if (!availableGenres.length && !loading) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 mb-6">
      <FilterSection label="Length">
        {RELEASE_TYPES.map((type) => (
          <FilterButton
            key={type}
            active={
              type === "all"
                ? selectedTypes.includes("all")
                : selectedTypes.includes(type)
            }
            onClick={() => !loading && onTypeChange(type)}
            disabled={loading}
            className={loading ? "animate-pulse" : ""}
          >
            {type === "all" ? "All" : type}
          </FilterButton>
        ))}
      </FilterSection>

      <FilterSection label="Genre Groups">
        {loading
          ? // Skeleton loading state for genres
            SKELETON_GENRES.map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-8 rounded-[6px] bg-[--color-gray-800] animate-pulse"
                style={{
                  width: `${Math.floor(Math.random() * (120 - 80) + 80)}px`,
                }}
              />
            ))
          : availableGenres.map((genre) => (
              <FilterButton
                key={genre}
                active={selectedGenres.includes(genre)}
                onClick={() => onGenreChange(genre)}
                disabled={loading}
              >
                {genre}
              </FilterButton>
            ))}
      </FilterSection>
    </div>
  );
}
