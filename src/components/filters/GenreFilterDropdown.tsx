import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/filter-select";

interface GenreFilterDropdownProps {
  genres: string[];
  selectedGenres: string[];
  onGenreChange: (genre: string, isSelected: boolean) => void;
  filterMode: "include" | "exclude";
  onFilterModeChange: (mode: "include" | "exclude") => void;
  disabled?: boolean;
}

export function GenreFilterDropdown({
  genres,
  selectedGenres,
  onGenreChange,
  filterMode,
  onFilterModeChange,
  disabled,
}: GenreFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleGenres, setVisibleGenres] = useState<string[]>(selectedGenres);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const genrePillRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();
  const lastWidthRef = useRef<number>(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    function updateVisibleGenres() {
      if (!contentRef.current || selectedGenres.length === 0) {
        setVisibleGenres(selectedGenres);
        return;
      }

      const container = contentRef.current;
      const containerWidth = container.offsetWidth;

      // Skip update if width change is very small
      const widthDiff = Math.abs(containerWidth - lastWidthRef.current);
      if (lastWidthRef.current && widthDiff < 5) {
        return;
      }
      lastWidthRef.current = containerWidth;

      const moreTextWidth = 70; // Width of "+ N more"
      const chevronWidth = 32; // Space for chevron
      const gapWidth = 16; // Gap between pills

      let availableWidth = containerWidth - chevronWidth;
      const visibleGenres: string[] = [];

      // Calculate how many genres fit
      for (const genre of selectedGenres) {
        const element = genrePillRefs.current.get(genre);
        if (!element) continue;

        const pillWidth = element.offsetWidth;

        // Account for gap if not the first pill
        const gapNeeded = visibleGenres.length > 0 ? gapWidth : 0;

        // Reserve space for "+N more" if we're not going to fit all genres
        const remainingGenres =
          selectedGenres.length - visibleGenres.length - 1;
        const needsMorePill = remainingGenres > 0;
        const moreTextNeeded = needsMorePill ? moreTextWidth + gapWidth : 0;

        // Total space needed for this pill
        const spaceNeeded = pillWidth + gapNeeded + moreTextNeeded;

        if (availableWidth - spaceNeeded >= 0) {
          availableWidth -= pillWidth + gapNeeded;
          visibleGenres.push(genre);
        } else {
          break;
        }
      }

      setVisibleGenres(visibleGenres);
    }

    // Initial render: show all genres, then calculate after refs are set
    timeoutId = setTimeout(updateVisibleGenres, 50);

    // Set up resize observer with debouncing
    const observer = new ResizeObserver(() => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(updateVisibleGenres, 100);
    });

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      observer.disconnect();
    };
  }, [selectedGenres]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Short timeout to allow DOM to update with new refs
    const timeoutId = setTimeout(() => {
      const updateVisibleGenres = () => {
        if (!contentRef.current || selectedGenres.length === 0) {
          setVisibleGenres(selectedGenres);
          return;
        }

        const container = contentRef.current;
        const containerWidth = container.offsetWidth;
        const moreTextWidth = 80;
        const chevronWidth = 32;
        const gapWidth = 16;

        let availableWidth = containerWidth - chevronWidth;
        const visibleGenres: string[] = [];

        for (const genre of selectedGenres) {
          const element = genrePillRefs.current.get(genre);
          if (!element) continue;

          const pillWidth = element.offsetWidth;
          const gapNeeded = visibleGenres.length > 0 ? gapWidth : 0;
          const remainingGenres =
            selectedGenres.length - visibleGenres.length - 1;
          const needsMorePill = remainingGenres > 0;
          const moreTextNeeded = needsMorePill ? moreTextWidth + gapWidth : 0;
          const spaceNeeded = pillWidth + gapNeeded + moreTextNeeded;

          if (availableWidth - spaceNeeded >= 0) {
            availableWidth -= pillWidth + gapNeeded;
            visibleGenres.push(genre);
          } else {
            break;
          }
        }

        setVisibleGenres(visibleGenres);
      };

      updateVisibleGenres();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [selectedGenres]);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleGenreClick = (genre: string) => {
    const isSelected = selectedGenres.includes(genre);
    const newSelectedGenres = isSelected
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];

    onGenreChange(genre, !isSelected);

    // Immediately update visible genres for removal
    if (isSelected) {
      setVisibleGenres((prev) => prev.filter((g) => g !== genre));
    }

    // Then schedule a full recalculation after DOM update
    setTimeout(() => {
      if (contentRef.current) {
        const container = contentRef.current;
        const containerWidth = container.offsetWidth;
        const moreTextWidth = 70;
        const chevronWidth = 32;
        const gapWidth = 16;
        const bufferSpace = 20; // Extra buffer to prevent flickering

        let availableWidth = containerWidth - chevronWidth - bufferSpace;
        const newVisibleGenres: string[] = [];

        // For newly added genres, we need to estimate their width
        const existingPills = Array.from(genrePillRefs.current.values());
        const averagePillWidth =
          existingPills.length > 0
            ? existingPills.reduce((sum, el) => sum + el.offsetWidth, 0) /
              existingPills.length
            : 100;

        // Always reserve space for "+N more" if we have more than one genre
        if (newSelectedGenres.length > 1) {
          availableWidth -= moreTextWidth + gapWidth;
        }

        for (const g of newSelectedGenres) {
          const element = genrePillRefs.current.get(g);
          // Add a small buffer to estimated width for safety
          const pillWidth = element
            ? element.offsetWidth
            : averagePillWidth + 10;
          const gapNeeded = newVisibleGenres.length > 0 ? gapWidth : 0;

          const spaceNeeded = pillWidth + gapNeeded;

          if (availableWidth - spaceNeeded >= 0) {
            availableWidth -= spaceNeeded;
            newVisibleGenres.push(g);
          } else {
            break;
          }
        }

        // If we couldn't fit all genres, remove the last one to ensure stable display
        if (
          newVisibleGenres.length < newSelectedGenres.length &&
          newVisibleGenres.length > 0
        ) {
          newVisibleGenres.pop();
        }

        setVisibleGenres(newVisibleGenres);
      }
    }, 50);
  };

  const handleRemoveGenre = (genre: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleGenreClick(genre);
  };

  const toggleFilterMode = () => {
    onFilterModeChange(filterMode === "include" ? "exclude" : "include");
  };

  return (
    <div className="genre-dropdown__container">
      <div className="genre-dropdown__mode">
        <Select
          value={filterMode}
          onValueChange={(value: "include" | "exclude") => onFilterModeChange(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="include">Include</SelectItem>
            <SelectItem value="exclude">Exclude</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="genre-dropdown__input" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className={cn(
            "genre-dropdown__input-button",
            disabled && "genre-dropdown__input-button--disabled"
          )}
        >
          <div ref={contentRef} className="genre-dropdown__input-content">
            {selectedGenres.length === 0 ? (
              <span className="genre-dropdown__input-placeholder">
                {`Select genres to ${filterMode}`}
              </span>
            ) : (
              <>
                {visibleGenres.map((genre) => (
                  <div
                    key={genre}
                    ref={(el) => el && genrePillRefs.current.set(genre, el)}
                    className="pill pill--ghost"
                  >
                    {genre}
                    <button
                      onClick={(e) => handleRemoveGenre(genre, e)}
                      className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  </div>
                ))}
                {visibleGenres.length < selectedGenres.length && (
                  <div className="pill pill--ghost pill--ghost--deemphasized">
                    & {selectedGenres.length - visibleGenres.length} more
                  </div>
                )}
              </>
            )}
          </div>
          <ChevronDown
            className={cn(
              "genre-dropdown__input-chevron",
              isOpen && "genre-dropdown__input-chevron--open"
            )}
          />
        </button>

        {isOpen && (
          <div className="genre-dropdown__menu">
            <div className="genre-dropdown__menu-content">
              <div className="genre-dropdown__menu-list">
                {genres.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      onClick={() => handleGenreClick(genre)}
                      className={cn(
                        "group genre-dropdown__option",
                        isSelected
                          ? "genre-dropdown__option--selected"
                          : "genre-dropdown__option--unselected"
                      )}
                    >
                      {genre}
                      {isSelected ? (
                        <X
                          size={14}
                          strokeWidth={2}
                          className="genre-dropdown__option-icon"
                        />
                      ) : (
                        <Plus
                          size={14}
                          strokeWidth={2}
                          className="genre-dropdown__option-icon"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
