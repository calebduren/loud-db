import React, { useState, useRef, useEffect } from "react";
import { X, Check, ChevronDown, Plus } from "lucide-react";
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

  const exactMatch = allGenres.find(
    (genre) => genre.toLowerCase() === searchQuery.toLowerCase()
  );

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      if (!value.includes(searchQuery.trim())) {
        addGenre(searchQuery.trim());
      }
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex-1">
      <div className="flex flex-wrap gap-2 p-2 min-h-[2.5rem] bg-white/5 border border-white/10 rounded-md focus-within:ring-2 focus-within:ring-white/20 focus-within:border-white/20 transition-all duration-200">
        {value.map((genre) => (
          <span key={genre} className="pill pill--genres">
            {genre}
            <button
              type="button"
              onClick={() => removeGenre(genre)}
              className="text-white hover:text-white transition-colors"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </span>
        ))}
        <div className="flex-1 relative">
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
            className="w-full bg-transparent border-none outline-none text-sm placeholder:text-white/40 pr-8"
          />
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
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
          ) : (
            <>
              {searchQuery.trim() && !exactMatch && (
                <button
                  onClick={() => {
                    addGenre(searchQuery.trim());
                    setIsOpen(false);
                  }}
                  className="w-full px-2 py-1 text-left text-sm hover:bg-white/5 flex items-center gap-2 text-emerald-400"
                >
                  <Plus size={14} />
                  <span>Create "{searchQuery.trim()}"</span>
                </button>
              )}

              {filteredGenres.length === 0 ? (
                <div className="px-2 py-1 text-sm text-white/60">
                  {searchQuery.trim()
                    ? "No matching genres"
                    : "Type to search or create a new genre"}
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
