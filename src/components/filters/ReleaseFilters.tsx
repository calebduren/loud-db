import React from "react";
import { cn } from "../../lib/utils";
import { FilterSection } from "./FilterSection";
import { GenreFilterDropdown } from "./GenreFilterDropdown";
import { ReleaseType } from "../../types/database";
import { useGenreGroups } from "../../hooks/useGenreGroups";

const releaseLengthOptions: { value: ReleaseType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "single" as ReleaseType, label: "Single" },
  { value: "EP" as ReleaseType, label: "EP" },
  { value: "LP" as ReleaseType, label: "LP" },
  { value: "compilation" as ReleaseType, label: "Compilation" },
];

interface ReleaseFiltersProps {
  loading?: boolean;
  selectedTypes: (ReleaseType | "all")[];
  selectedGenres: string[];
  genreFilterMode: "exclude" | "include";
  onTypeChange: (type: ReleaseType | "all") => void;
  onGenreChange: (genre: string) => void;
  onGenreFilterModeChange: (mode: "exclude" | "include") => void;
}

export function ReleaseFilters({
  loading,
  selectedTypes,
  selectedGenres,
  genreFilterMode,
  onTypeChange,
  onGenreChange,
  onGenreFilterModeChange,
}: ReleaseFiltersProps) {
  const { genreGroups } = useGenreGroups();
  const availableGenres = Object.keys(genreGroups).sort();

  if (!selectedTypes || !selectedGenres) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      <FilterSection label="Filter by length">
        {releaseLengthOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => !loading && onTypeChange(option.value)}
            className={cn(
              "pill pill--interactive",
              selectedTypes.includes(option.value) && "pill--selected",
              loading && "animate-pulse"
            )}
            disabled={loading}
          >
            {option.label}
          </button>
        ))}
      </FilterSection>

      <FilterSection label="Filter by genre" className="flex-1 min-w-0">
        <GenreFilterDropdown
          genres={availableGenres}
          selectedGenres={selectedGenres}
          onGenreChange={onGenreChange}
          filterMode={genreFilterMode}
          onFilterModeChange={onGenreFilterModeChange}
        />
      </FilterSection>
    </div>
  );
}
