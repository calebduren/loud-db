import React from "react";
import { X, ChevronDown, Plus } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import { Button } from "@/components/ui/button";

interface Artist {
  id?: string;
  name: string;
}

interface ArtistSearchInputProps {
  selectedArtists: Artist[];
  artistOptions: Artist[];
  onArtistChange: (
    index: number,
    value: string,
    availableArtists: Artist[]
  ) => void;
  onAddArtist: () => void;
  onRemoveArtist: (index: number) => void;
}

export function ArtistSearchInput({
  selectedArtists,
  artistOptions,
  onArtistChange,
  onAddArtist,
  onRemoveArtist,
}: ArtistSearchInputProps) {
  const [inputStates, setInputStates] = React.useState<{
    [key: number]: { focused: boolean; value: string };
  }>({});

  const getFilteredOptions = (value: string) => {
    if (!value) return artistOptions;
    const searchTerm = value.toLowerCase();
    return artistOptions.filter(
      (option) =>
        option.name.toLowerCase().includes(searchTerm) &&
        option.name.toLowerCase() !== searchTerm
    );
  };

  const handleInputChange = (index: number, value: string, options: Artist[]) => {
    setInputStates((prev) => ({
      ...prev,
      [index]: { ...prev[index], value },
    }));
    onArtistChange(index, value, options);
  };

  const handleFocus = (index: number) => {
    setInputStates((prev) => ({
      ...prev,
      [index]: { focused: true, value: selectedArtists[index].name },
    }));
  };

  const handleBlur = (index: number) => {
    // Small delay to allow click events on options to fire
    setTimeout(() => {
      setInputStates((prev) => ({
        ...prev,
        [index]: { focused: false, value: selectedArtists[index].name },
      }));
    }, 200);
  };

  const handleOptionClick = (index: number, optionName: string) => {
    onArtistChange(index, optionName, artistOptions);
    setInputStates((prev) => ({
      ...prev,
      [index]: { focused: false, value: optionName },
    }));
  };

  return (
    <div className="space-y-2">
      {selectedArtists.map((artist, index) => {
        const state = inputStates[index] || {
          focused: false,
          value: artist.name,
        };
        const filteredOptions = getFilteredOptions(state.value);

        return (
          <div key={index} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <FormInput
                value={artist.name}
                onChange={(e) => handleInputChange(index, e.target.value, artistOptions)}
                onFocus={() => handleFocus(index)}
                onBlur={() => handleBlur(index)}
                placeholder="Enter artist name"
                className="w-full pr-8"
              />
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />

              {state.focused && filteredOptions.length > 0 && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 rounded-md border border-white/10 bg-[#1a1a1a] shadow-md py-1">
                  {filteredOptions.map((option) => (
                    <div
                      key={option.id}
                      className="px-2 py-1.5 cursor-pointer hover:bg-white/10 text-sm"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleOptionClick(index, option.name);
                      }}
                    >
                      {option.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              size="icon"
              type="button"
              onClick={() => {
                if (index === 0) {
                  // For the first artist, clear the input instead of removing
                  handleInputChange(0, "", artistOptions);
                } else {
                  onRemoveArtist(index);
                }
              }}
              disabled={!artist.name.trim()} // Disable if no artist name entered
              className="h-[34px] w-[34px] shrink-0 hover:bg-white/10 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      <Button type="button" variant="link" size="link" onClick={onAddArtist}>
        <Plus size={14} strokeWidth={1.5} /> Add Artist
      </Button>
    </div>
  );
}
