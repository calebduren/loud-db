import React, { useCallback, useMemo } from "react";
import { cn } from "../../lib/utils";
import { FilterSection } from "./FilterSection";
import { GenreFilterDropdown } from "./GenreFilterDropdown";
import { ReleaseType } from "../../types/database";
import { useGenreGroups } from "../../hooks/useGenreGroups";
import { Button } from "../ui/button";
import { ListFilter, X } from "lucide-react";
import { Tooltip } from "../ui/tooltip";
import { RELEASE_TYPES, RELEASE_TYPE_LABELS } from "@/constants/releases";

interface ReleaseFiltersProps {
  loading?: boolean;
  selectedTypes: (ReleaseType | "all")[];
  selectedGenres: string[];
  genreFilterMode: "exclude" | "include";
  onTypeChange: (type: (ReleaseType | "all")[]) => void;
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
  const {
    genreGroups,
    loading: groupsLoading,
    error: groupsError,
  } = useGenreGroups();
  const availableGenres = Object.keys(genreGroups).sort();

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
    onTypeChange(["all"]);
    onGenreChange([]);
    onGenreFilterModeChange("include");
  }, [onTypeChange, onGenreChange, onGenreFilterModeChange]);

  const handleTypeSelect = useCallback(
    (type: ReleaseType | "all") => {
      if (type === "all") {
        onTypeChange(["all"]);
      } else {
        const newTypes = selectedTypes.includes(type)
          ? selectedTypes.filter((t) => t !== type)
          : [...selectedTypes.filter((t) => t !== "all"), type];

        // If no types are selected, default back to "all"
        onTypeChange(newTypes.length === 0 ? ["all"] : newTypes);
      }
    },
    [selectedTypes, onTypeChange]
  );

  const isDefaultState = useMemo(
    () =>
      selectedTypes.length === 1 &&
      selectedTypes[0] === "all" &&
      selectedGenres.length === 0 &&
      genreFilterMode === "include",
    [selectedTypes, selectedGenres, genreFilterMode]
  );

  const releaseLengthOptions: { value: ReleaseType | "all"; label: string }[] =
    [
      { value: "all", label: RELEASE_TYPE_LABELS.all },
      ...RELEASE_TYPES.map((type) => ({
        value: type,
        label: RELEASE_TYPE_LABELS[type],
      })),
    ];

  if (groupsLoading) {
    return <div>Loading filters...</div>;
  }

  if (groupsError) {
    return (
      <div className="text-red-500">
        Error loading filters. Please try again later.
      </div>
    );
  }

  if (!selectedTypes || !selectedGenres) {
    return null;
  }

  return (
    <div className="filters-container">
      {isDefaultState ? (
        <div className="w-[--input-height] h-[--input-height] flex items-center justify-center">
          <ListFilter
            size="16"
            strokeWidth={1.5}
            color="var(--color-gray-400)"
          />
        </div>
      ) : (
        <Tooltip position="top" align="center" text="Reset filters">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleReset}
            className="w-[--input-height] h-[--input-height]"
          >
            <X size="16" strokeWidth={1.5} />
          </Button>
        </Tooltip>
      )}
      <div className="filter-divider" />
      <FilterSection label="Length">
        {releaseLengthOptions.map((option, index) => (
          <React.Fragment key={option.value}>
            <button
              className={cn("btn btn--lg", {
                "btn--primary": selectedTypes.includes(option.value),
                "btn--secondary": !selectedTypes.includes(option.value),
              })}
              onClick={() => handleTypeSelect(option.value)}
            >
              {option.label}
            </button>
            {index === 0 && <div className="length-divider" />}
          </React.Fragment>
        ))}
      </FilterSection>
      <div className="filter-divider" />
      <FilterSection label="Genres" className="flex-1">
        <GenreFilterDropdown
          genres={availableGenres}
          selectedGenres={selectedGenres}
          onGenreChange={handleGenreToggle}
          filterMode={genreFilterMode}
          onFilterModeChange={onGenreFilterModeChange}
          disabled={loading}
        />
      </FilterSection>
    </div>
  );
}
