import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useRelatedArtists } from './useRelatedArtists';
import { FormValues } from '../components/admin/forms/releaseFormSchema';

export function useRelatedArtistsForm(
  form: UseFormReturn<FormValues>,
  artistNames: string[]
) {
  const { relatedArtists } = useRelatedArtists(artistNames);
  const prevRelatedArtistsRef = useRef<string>('');
  const prevArtistNamesRef = useRef<string>('');

  useEffect(() => {
    // Only update if artist names have changed
    const artistNamesStr = JSON.stringify(artistNames);
    if (artistNamesStr === prevArtistNamesRef.current) {
      return;
    }
    prevArtistNamesRef.current = artistNamesStr;

    if (relatedArtists.length > 0) {
      const newValue = relatedArtists.map(artist => ({
        name: artist.name,
        popularity: artist.popularity
      }));

      const newValueStr = JSON.stringify(newValue);
      if (newValueStr !== prevRelatedArtistsRef.current) {
        prevRelatedArtistsRef.current = newValueStr;
        form.setValue('related_artists', newValue, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: false // Prevent validation on every update
        });
      }
    }
  }, [relatedArtists, artistNames, form]);
}