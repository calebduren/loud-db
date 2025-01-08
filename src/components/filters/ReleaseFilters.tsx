import React from "react";
import { ReleaseType } from "../../types/database";
import { FilterSection } from "./FilterSection";
import { FilterButton } from "./FilterButton";
import { GenreFilterDropdown } from "./GenreFilterDropdown";

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
  genreFilterMode?: "include" | "exclude";
  onGenreFilterModeChange?: (mode: "include" | "exclude") => void;
}

export function ReleaseFilters({
  loading,
  selectedTypes,
  selectedGenres,
  availableGenres,
  onTypeChange,
  onGenreChange,
  genreFilterMode = "include",
  onGenreFilterModeChange = () => {},
}: ReleaseFiltersProps) {
  if (!availableGenres.length && !loading) {
    return null;
  }

  return (
    <div className="flex flex-row gap-8 mb-6">
      <FilterSection label="Filter by release length">
        {RELEASE_TYPES.map((type) => (
          <React.Fragment key={type}>
            <FilterButton
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
            {type === "all" && (
              <div className="h-6 w-px bg-white/10 mx-2" aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </FilterSection>
      <FilterSection label="Filter by genre" className="flex-1 min-w-0">
        <GenreFilterDropdown
          genres={availableGenres}
          selectedGenres={selectedGenres}
          onGenreChange={onGenreChange}
          filterMode={genreFilterMode}
          onFilterModeChange={onGenreFilterModeChange}
          disabled={loading}
        />
      </FilterSection>
    </div>
  );
}
