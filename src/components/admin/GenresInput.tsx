import React, { useState } from 'react';
import { X } from 'lucide-react';

interface GenresInputProps {
  value: string[];
  onChange: (genres: string[]) => void;
}

export function GenresInput({ value, onChange }: GenresInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addGenre();
    }
  };

  const addGenre = () => {
    const genre = inputValue.trim();
    if (genre && !value.includes(genre)) {
      onChange([...value, genre]);
      setInputValue('');
    }
  };

  const removeGenre = (genreToRemove: string) => {
    onChange(value.filter(genre => genre !== genreToRemove));
  };

  return (
    <div className="relative flex-1">
      <div className="flex flex-wrap gap-2 p-2 min-h-[2.5rem] bg-white/5 border border-white/10 rounded-md focus-within:ring-2 focus-within:ring-white/20 focus-within:border-white/20 transition-all duration-200">
        {value.map(genre => (
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
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={addGenre}
          placeholder={value.length === 0 ? "Type a genre and press Enter or comma" : ""}
          className="flex-1 min-w-[200px] bg-transparent border-none outline-none text-white placeholder-white/40 text-sm p-0.5"
        />
      </div>
    </div>
  );
}