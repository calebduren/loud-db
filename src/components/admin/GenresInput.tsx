import React, { useState, useRef, useEffect } from "react";
import { X, Check, ChevronDown } from "lucide-react";
import { useAllGenres } from "@/hooks/admin/useAllGenres";
import { cn } from "@/lib/utils";

interface GenresInputProps {
  value: string[];
  onChange: (genres: string[]) => void;
}

export function GenresInput({ value, onChange }: GenresInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { genres: allGenres, loading } = useAllGenres();

  // Filter genres based on search query and already selected genres
  const filteredGenres = allGenres
    .filter(
      (genre) =>
        !value.includes(genre) &&
        genre.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 100); // Limit to 100 results for performance

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

  const removeGenre = (genreToRemove: string) => {
    onChange(value.filter((genre) => genre !== genreToRemove));
  };

  const addGenre = (genre: string) => {
    if (!value.includes(genre)) {
      onChange([...value, genre]);
      setSearchQuery("");
    }
  };

  return (
    <div className="relative flex-1">
      <div className="flex flex-wrap gap-2 p-2 min-h-[2.5rem] bg-white/5 border border-white/10 rounded-md focus-within:ring-2 focus-within:ring-white/20 focus-within:border-white/20 transition-all duration-200">
        {value.map((genre) => (
          <span
            key={genre}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 text-white rounded-full text-sm"
          >
            {genre}
            <button
              type="button"
              onClick={() => removeGenre(genre)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </span>
        ))}
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={value.length === 0 ? "Search genres..." : ""}
            className="w-full bg-transparent border-none outline-none text-sm placeholder:text-white/40"
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 py-1 bg-zinc-900 border border-white/10 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {loading ? (
            <div className="px-2 py-1 text-sm text-white/60">Loading...</div>
          ) : filteredGenres.length === 0 ? (
            <div className="px-2 py-1 text-sm text-white/60">
              {searchQuery ? "No matching genres" : "No genres available"}
            </div>
          ) : (
            filteredGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  addGenre(genre);
                  setIsOpen(false);
                }}
                className="w-full px-2 py-1 text-left text-sm hover:bg-white/5 flex items-center justify-between group"
              >
                <span>{genre}</span>
                <Check
                  size={14}
                  className="opacity-0 group-hover:opacity-100 text-white/60"
                />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
