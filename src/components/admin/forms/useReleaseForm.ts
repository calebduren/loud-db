import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../../lib/supabase';
import { formSchema, FormValues } from './releaseFormSchema';
import { Release } from '../../../types/database';
import { AuthContext } from "../../../contexts/AuthContext";
import { filterValidGenres } from '../../../lib/utils/genreUtils';
import { checkDuplicateRelease } from '../../../lib/releases/validation';
import { useToast } from '../../../hooks/useToast';

interface ArtistData {
  id?: string;
  name: string;
}

export function useReleaseForm(
  release: Release | undefined, 
  onSuccess?: () => void
) {
  const [loading, setLoading] = useState(false);
  const { user } = React.useContext(AuthContext);
  const { showToast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      release_type: 'single',
      cover_url: '',
      genres: [],
      record_label: '',
      track_count: 1,
      spotify_url: '',
      apple_music_url: '',
      release_date: new Date().toISOString().split('T')[0],
      related_artists: []
    }
  });

  const handleSubmit = async (values: FormValues, artists: ArtistData[]) => {
    if (!user) return;
    setLoading(true);

    try {
      // Get existing artist IDs
      const existingArtists = await Promise.all(
        artists.map(async artist => {
          if (artist.id) return artist.id;
          
          const { data } = await supabase
            .from('artists')
            .select('id')
            .ilike('name', artist.name.trim())
            .maybeSingle();
            
          return data?.id;
        })
      );

      const artistIds = existingArtists.filter(Boolean) as string[];

      // Check for duplicates if creating new release
      if (!release) {
        const isDuplicate = await checkDuplicateRelease(values.name, artistIds);
        if (isDuplicate) {
          showToast({
            type: 'error',
            message: 'A release with this name and artists already exists'
          });
          setLoading(false);
          return;
        }
      }

      // Continue with save logic...
      const validGenres = filterValidGenres(values.genres);
      
      if (release) {
        // Update existing release
        const { error: releaseError } = await supabase
          .from('releases')
          .update({
            name: values.name,
            release_type: values.release_type,
            cover_url: values.cover_url,
            genres: validGenres,
            record_label: values.record_label,
            track_count: values.track_count,
            spotify_url: values.spotify_url,
            apple_music_url: values.apple_music_url,
            release_date: values.release_date
          })
          .eq('id', release.id);

        if (releaseError) throw releaseError;

        // Update artists
        await supabase
          .from('release_artists')
          .delete()
          .eq('release_id', release.id);

        await Promise.all(
          artistIds.map((artistId, index) => 
            supabase
              .from('release_artists')
              .insert({
                release_id: release.id,
                artist_id: artistId,
                position: index
              })
          )
        );

        // Update related artists
        await supabase
          .from('related_artists')
          .delete()
          .eq('release_id', release.id);

        if (values.related_artists.length > 0) {
          await supabase
            .from('related_artists')
            .insert(
              values.related_artists.map(artist => ({
                release_id: release.id,
                artist_name: artist.name,
                popularity: artist.popularity
              }))
            );
        }
      } else {
        // Create new release
        const { data: newRelease, error: releaseError } = await supabase
          .from('releases')
          .insert({
            name: values.name,
            release_type: values.release_type,
            cover_url: values.cover_url,
            genres: validGenres,
            record_label: values.record_label,
            track_count: values.track_count,
            spotify_url: values.spotify_url,
            apple_music_url: values.apple_music_url,
            release_date: values.release_date,
            created_by: user.id
          })
          .select()
          .single();

        if (releaseError) throw releaseError;

        if (newRelease) {
          // Create artist relationships
          await Promise.all(
            artistIds.map((artistId, index) => 
              supabase
                .from('release_artists')
                .insert({
                  release_id: newRelease.id,
                  artist_id: artistId,
                  position: index
                })
            )
          );

          // Create related artists
          if (values.related_artists.length > 0) {
            await supabase
              .from('related_artists')
              .insert(
                values.related_artists.map(artist => ({
                  release_id: newRelease.id,
                  artist_name: artist.name,
                  popularity: artist.popularity
                }))
              );
          }
        }
      }

      showToast({
        type: 'success',
        message: release ? 'Release updated successfully' : 'Release created successfully'
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error saving release:', error);
      showToast({
        type: 'error',
        message: 'Failed to save release'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    handleSubmit
  };
}