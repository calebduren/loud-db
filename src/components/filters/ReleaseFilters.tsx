import React, { useCallback } from "react";
import { cn } from "../../lib/utils";
import { FilterSection } from "./FilterSection";
import { GenreFilterDropdown } from "./GenreFilterDropdown";
import { ReleaseType } from "../../types/database";
import { useGenreGroups } from "../../hooks/useGenreGroups";
import { Button } from "../ui/button";

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
  setSelectedGenres: (genres: string[]) => void;
}

export function ReleaseFilters({
  loading,
  selectedTypes,
  selectedGenres,
  genreFilterMode,
  onTypeChange,
  onGenreChange,
  onGenreFilterModeChange,
  setSelectedGenres,
}: ReleaseFiltersProps) {
  const { genreGroups } = useGenreGroups();
  const availableGenres = Object.keys(genreGroups).sort();

  if (!selectedTypes || !selectedGenres) {
    return null;
  }

  const handleReset = useCallback(() => {
    onTypeChange("all");
    setSelectedGenres([]);
  }, [onTypeChange, setSelectedGenres]);

  return (
    <div className="flex gap-8 items-end">
      <FilterSection label="Length">
        {releaseLengthOptions.map((option, index) => (
          <React.Fragment key={option.value}>
            <button
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
            {index === 0 && <div className="vertical-divider" />}
          </React.Fragment>
        ))}
      </FilterSection>

      <FilterSection label="Genre" className="flex-1 min-w-0">
        <GenreFilterDropdown
          genres={availableGenres}
          selectedGenres={selectedGenres}
          onGenreChange={onGenreChange}
          filterMode={genreFilterMode}
          onFilterModeChange={onGenreFilterModeChange}
        />
      </FilterSection>

      <Button
        onClick={handleReset}
        variant="secondary"
        disabled={
          selectedTypes.length === 1 &&
          selectedTypes[0] === "all" &&
          selectedGenres.length === 0
        }
      >
        Reset
      </Button>
    </div>
  );
}
