import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface GenreFilterDropdownProps {
  genres: string[];
  selectedGenres: string[];
  onGenreChange: (genre: string) => void;
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
  const [isFilterModeOpen, setIsFilterModeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterModeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
      if (
        filterModeRef.current &&
        !filterModeRef.current.contains(event.target as Node)
      ) {
        setIsFilterModeOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleGenreClick = (genre: string) => {
    onGenreChange(genre);
  };

  const handleRemoveGenre = (genre: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onGenreChange(genre);
  };

  return (
    <div className="genre-dropdown__container">
      <div className="genre-dropdown__mode" ref={filterModeRef}>
        <button
          onClick={() => setIsFilterModeOpen(!isFilterModeOpen)}
          className="genre-dropdown__mode-button"
        >
          {filterMode === "include" ? "Include" : "Exclude"}
          <ChevronDown
            className={cn(
              "genre-dropdown__mode-chevron",
              isFilterModeOpen && "genre-dropdown__mode-chevron--open"
            )}
          />
        </button>

        {isFilterModeOpen && (
          <div className="genre-dropdown__mode-menu">
            <div className="py-1">
              <button
                onClick={() => {
                  onFilterModeChange("exclude");
                  setIsFilterModeOpen(false);
                }}
                className={cn(
                  "genre-dropdown__mode-option",
                  filterMode === "exclude"
                    ? "genre-dropdown__mode-option--selected"
                    : "genre-dropdown__mode-option--unselected"
                )}
              >
                Exclude
              </button>
              <button
                onClick={() => {
                  onFilterModeChange("include");
                  setIsFilterModeOpen(false);
                }}
                className={cn(
                  "genre-dropdown__mode-option",
                  filterMode === "include"
                    ? "genre-dropdown__mode-option--selected"
                    : "genre-dropdown__mode-option--unselected"
                )}
              >
                Include
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="genre-dropdown__input" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className={cn(
            "genre-dropdown__input-button",
            disabled && "genre-dropdown__input-button--disabled"
          )}
        >
          <div className="genre-dropdown__input-content">
            {selectedGenres.length === 0 ? (
              <span className="genre-dropdown__input-placeholder">
                {`Select genres to ${filterMode}`}
              </span>
            ) : (
              selectedGenres.map((genre) => (
                <div key={genre} className="genre-dropdown__pill">
                  {genre}
                  <span
                    onClick={(e) => handleRemoveGenre(genre, e)}
                    className="genre-dropdown__pill-remove cursor-pointer"
                  >
                    <X />
                  </span>
                </div>
              ))
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
                          size={13}
                          strokeWidth={2.5}
                          className="genre-dropdown__option-icon"
                        />
                      ) : (
                        <Plus
                          size={13}
                          strokeWidth={2.5}
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
