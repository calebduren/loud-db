import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { X, Check, ChevronDown, Plus } from "lucide-react";
import { useAllGenres } from "@/hooks/admin/useAllGenres";
import { useGenreGroups } from "@/hooks/useGenreGroups";
import { cn } from "@/lib/utils";
import { normalizeGenre } from "@/lib/utils/genreUtils";

interface GenresInputProps {
  value: string[];
  onChange: (genres: string[]) => void;
}

export function GenresInput({ value = [], onChange }: GenresInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { genres: allGenres = [], loading: genresLoading } = useAllGenres();
  const { genreGroups = {}, loading: groupsLoading } = useGenreGroups();

  const isLoading = useMemo(() => genresLoading || groupsLoading, [genresLoading, groupsLoading]);

  const filteredGroupNames = useMemo(() => {
    if (isLoading) return [];
    return Object.keys(genreGroups).filter(
      (name) =>
        !value.includes(name) &&
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [genreGroups, value, searchQuery, isLoading]);

  const filteredGenres = useMemo(() => {
    if (isLoading) return [];
    return allGenres
      .filter(
        (genre) =>
          !value.includes(genre) &&
          genre.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !Object.keys(genreGroups).includes(genre)
      )
      .slice(0, 100);
  }, [allGenres, value, searchQuery, genreGroups, isLoading]);

  const exactMatch = useMemo(() => {
    if (isLoading) return undefined;
    return allGenres.find(
      (genre) => genre.toLowerCase() === searchQuery.toLowerCase()
    );
  }, [allGenres, searchQuery, isLoading]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const removeGenre = useCallback((genreToRemove: string) => {
    onChange(value.filter((genre) => genre !== genreToRemove));
  }, [value, onChange]);

  const addGenre = useCallback((genre: string) => {
    const normalizedGenre = normalizeGenre(genre);
    if (!value.includes(normalizedGenre)) {
      onChange([...value, normalizedGenre]);
      setSearchQuery("");
    }
  }, [value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      if (!value.includes(searchQuery.trim())) {
        addGenre(searchQuery.trim());
      }
      setIsOpen(false);
    }
  }, [searchQuery, value, addGenre]);

  if (isLoading) {
    return (
      <div className="relative flex-1">
        <div className="flex h-[--input-height] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-white/40 focus-within:outline-none focus-within:ring-2 focus-within:ring-white/20 focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200">
          <div className="flex-1 relative min-w-[120px] flex items-center">
            <input
              disabled
              type="text"
              placeholder="Loading genres..."
              className="no-focus w-full bg-transparent border-0 outline-0 ring-0 p-0 text-sm placeholder:text-white/40"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-white/40 border-t-transparent rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      <div className="flex h-[--input-height] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-white/40 focus-within:outline-none focus-within:ring-2 focus-within:ring-white/20 focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200">
        {value.map((genre) => (
          <span key={genre} className="pill pill--genres">
            {genre}
            <button
              type="button"
              onClick={() => removeGenre(genre)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </span>
        ))}
        <div className="flex-1 relative min-w-[120px]">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onClick={() => setIsOpen(true)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? "Search or create genres..." : ""}
            className="no-focus w-full bg-transparent border-0 outline-0 ring-0 p-0 text-sm placeholder:text-white/40"
          />
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 py-1 bg-[--color-gray-900] border border-white/10 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredGroupNames.length > 0 && (
            <>
              <div className="px-2 py-1 text-sm text-white/40 select-none">
                Parent Genres
              </div>
              {filteredGroupNames.map((groupName) => (
                <button
                  key={groupName}
                  onClick={() => {
                    addGenre(groupName);
                    setIsOpen(false);
                  }}
                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-white/5 flex items-center justify-between group"
                >
                  <span>{groupName}</span>
                  <Check
                    size={14}
                    className="opacity-0 group-hover:opacity-100 text-white/60"
                  />
                </button>
              ))}
              <div className="h-px bg-white/10 my-1" />
            </>
          )}

          {filteredGenres.length > 0 && (
            <>
              <div className="px-2 py-1 text-sm text-white/40 select-none">
                All Genres
              </div>
              {filteredGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    addGenre(genre);
                    setIsOpen(false);
                  }}
                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-white/5 flex items-center justify-between group"
                >
                  <span>{genre}</span>
                  <Check
                    size={14}
                    className="opacity-0 group-hover:opacity-100 text-white/60"
                  />
                </button>
              ))}
            </>
          )}

          {searchQuery.trim() && !exactMatch && (
            <button
              onClick={() => {
                addGenre(searchQuery.trim());
                setIsOpen(false);
              }}
              className="w-full px-2 py-1.5 text-left text-sm hover:bg-white/5 flex items-center gap-2 text-emerald-400"
            >
              <Plus size={14} />
              <span>Create "{searchQuery.trim()}"</span>
            </button>
          )}

          {filteredGenres.length === 0 &&
            filteredGroupNames.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-white/40">
                {searchQuery.trim()
                  ? "No matching genres"
                  : "Type to search or create a new genre"}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
