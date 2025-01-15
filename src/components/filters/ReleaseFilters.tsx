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
  onGenreChange: (genres: string[]) => void;
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

  const handleGenreToggle = useCallback(
    (genre: string) => {
      const newGenres = selectedGenres.includes(genre)
        ? selectedGenres.filter((g) => g !== genre)
        : [...selectedGenres, genre];
      onGenreChange(newGenres);
    },
    [selectedGenres, onGenreChange]
  );

  const handleReset = useCallback(() => {
    onTypeChange("all");
    onGenreChange([]);
    onGenreFilterModeChange("include");
  }, [onTypeChange, onGenreChange, onGenreFilterModeChange]);

  const isDefaultState =
    selectedTypes.length === 1 &&
    selectedTypes[0] === "all" &&
    selectedGenres.length === 0 &&
    genreFilterMode === "include";

  return (
    <div className="flex gap-7">
      <FilterSection label="Length">
        {releaseLengthOptions.map((option, index) => (
          <React.Fragment key={option.value}>
            <button
              className={cn("pill pill--interactive", {
                "pill--selected": selectedTypes.includes(option.value),
              })}
              onClick={() => onTypeChange(option.value)}
            >
              {option.label}
            </button>
            {index === 0 && <div className="vertical-divider" />}
          </React.Fragment>
        ))}
      </FilterSection>

      <FilterSection label="Genre" className="flex-1">
        <GenreFilterDropdown
          genres={availableGenres}
          selectedGenres={selectedGenres}
          onGenreChange={handleGenreToggle}
          filterMode={genreFilterMode}
          onFilterModeChange={onGenreFilterModeChange}
          disabled={loading}
        />
      </FilterSection>

      <Button
        onClick={handleReset}
        variant="secondary"
        disabled={isDefaultState}
        className="self-end"
      >
        Reset
      </Button>
    </div>
  );
}
