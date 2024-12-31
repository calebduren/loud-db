import { useState } from 'react';
import { Artist } from '../types/database';

interface SelectedArtist {
  id?: string;
  name: string;
}

export function useArtistSelection(initialArtists: SelectedArtist[] = [{ name: '' }]) {
  const [selectedArtists, setSelectedArtists] = useState<SelectedArtist[]>(initialArtists);

  const handleArtistChange = (index: number, value: string, availableArtists: Artist[]) => {
    const newArtists = [...selectedArtists];
    const existingArtist = availableArtists?.find(a => 
      a.name.toLowerCase() === value.toLowerCase()
    );
    
    newArtists[index] = existingArtist 
      ? { id: existingArtist.id, name: existingArtist.name }
      : { name: value };
    
    setSelectedArtists(newArtists);
  };

  const addArtist = () => {
    setSelectedArtists([...selectedArtists, { name: '' }]);
  };

  const removeArtist = (index: number) => {
    if (selectedArtists.length > 1) {
      setSelectedArtists(selectedArtists.filter((_, i) => i !== index));
    }
  };

  return {
    selectedArtists,
    setSelectedArtists,
    handleArtistChange,
    addArtist,
    removeArtist
  };
}