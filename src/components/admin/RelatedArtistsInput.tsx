import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '../ui/input';

interface RelatedArtist {
  name: string;
  popularity?: number;
  topTracks?: { name: string; preview_url: string | null; }[];
}

interface RelatedArtistsInputProps {
  value: RelatedArtist[];
  onChange: (artists: RelatedArtist[]) => void;
}

export function RelatedArtistsInput({ value, onChange }: RelatedArtistsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addArtist();
    }
  };

  const addArtist = () => {
    const name = inputValue.trim();
    if (name && !value.some(a => a.name.toLowerCase() === name.toLowerCase())) {
      onChange([...value, { name }]);
      setInputValue('');
    }
  };

  const removeArtist = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {value.map((artist, index) => (
          <div key={index} className="flex items-center gap-2 bg-white/5 p-3 rounded-md">
            <div className="flex-1">
              <div className="font-medium">{artist.name}</div>
              {artist.popularity && (
                <div className="text-sm text-white/60">
                  Popularity: {artist.popularity}%
                </div>
              )}
              {artist.topTracks && artist.topTracks.length > 0 && (
                <div className="mt-2 text-sm text-white/60">
                  <div>Top Tracks:</div>
                  <ul className="list-disc list-inside">
                    {artist.topTracks.map((track, i) => (
                      <li key={i}>{track.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeArtist(index)}
              className="text-white/60 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Enter related artist name"
          className="flex-1"
        />
        <button
          type="button"
          onClick={addArtist}
          className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  );
}