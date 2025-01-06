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
    <div className="flex flex-wrap gap-6 mb-6">
      <FilterSection label="Length">
        {RELEASE_TYPES.map((type) => (
          <FilterButton
            key={type}
            active={type === "all" ? selectedTypes.includes("all") : selectedTypes.includes(type)}
            onClick={() => !loading && onTypeChange(type)}
            disabled={loading}
          >
            {type === "all" ? "All" : type}
          </FilterButton>
        ))}
      </FilterSection>

      <FilterSection label="Genre Groups">
        {availableGenres.map((genre) => (
          <FilterButton
            key={genre}
            active={selectedGenres.includes(genre)}
            onClick={() => !loading && onGenreChange(genre)}
            disabled={loading}
          >
            {genre}
          </FilterButton>
        ))}
      </FilterSection>
    </div>
  );
}
