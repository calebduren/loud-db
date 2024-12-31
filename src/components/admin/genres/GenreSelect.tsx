import React, { useState, useEffect, useMemo } from 'react';
import { useReleases } from '../../../hooks/useReleases';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Check, Search, X } from 'lucide-react';

interface GenreSelectProps {
  onSubmit: (genres: string[]) => Promise<void>;
  disabled?: boolean;
}

export function GenreSelect({ onSubmit, disabled }: GenreSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { releases } = useReleases();
  const [loading, setLoading] = useState(false);

  // Get unique genres from all releases
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    releases.forEach(release => {
      release.genres.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  }, [releases]);

  // Filter genres based on search query
  const filteredGenres = useMemo(() => {
    if (!searchQuery) return allGenres;
    const query = searchQuery.toLowerCase();
    return allGenres.filter(genre => 
      genre.toLowerCase().includes(query)
    );
  }, [allGenres, searchQuery]);

  const handleSubmit = async () => {
    if (selectedGenres.length === 0) return;
    
    setLoading(true);
    try {
      await onSubmit(selectedGenres);
      setSelectedGenres([]);
      setIsOpen(false);
      setSearchQuery('');
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const removeGenre = (genre: string) => {
    setSelectedGenres(prev => prev.filter(g => g !== genre));
  };

  return (
    <div className="space-y-2">
      {/* Selected Genre Pills */}
      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGenres.map(genre => (
            <div
              key={genre}
              className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full text-sm"
            >
              {genre}
              <button
                onClick={() => removeGenre(genre)}
                className="text-white/60 hover:text-white ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Genre Select Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left bg-white/5 border border-white/10 rounded-md hover:bg-white/10 transition-colors"
          disabled={disabled}
        >
          Select genres to add...
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-1 bg-gray-900 border border-white/10 rounded-md shadow-lg overflow-hidden">
              {/* Search Input */}
              <div className="p-2 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search genres..."
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Genre List */}
              <div className="max-h-48 overflow-auto">
                <div className="p-2 grid gap-1">
                  {filteredGenres.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left rounded hover:bg-white/10"
                    >
                      <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                        selectedGenres.includes(genre)
                          ? 'bg-white border-white'
                          : 'border-white/40'
                      }`}>
                        {selectedGenres.includes(genre) && (
                          <Check className="w-3 h-3 text-black" />
                        )}
                      </div>
                      {genre}
                    </button>
                  ))}
                  {filteredGenres.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-white/40">
                      No genres found
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              {selectedGenres.length > 0 && (
                <div className="p-2 border-t border-white/10">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Adding...' : 'Add Selected Genres'}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}