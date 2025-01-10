import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, FormValues } from '../components/admin/forms/releaseFormSchema';
import { Release } from '../types/database';
import { ArtistData } from '../types/forms';
import { useAuth } from './useAuth';
import { createOrUpdateRelease } from '../lib/releases/releaseService';
import { validateNewRelease } from '../lib/validation/releaseValidation';
import { ReleaseValidationError } from '../lib/errors/releaseErrors';
import { useToast } from './useToast';

export function useReleaseForm(release?: Release) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReleaseValidationError | null>(null);
  const { user } = useAuth();
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
      description: '',
      tracks: [],
      related_artists: []
    }
  });

  const handleSubmit = async (values: FormValues, artists: ArtistData[]): Promise<string | false> => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);

    try {
      // Validate for duplicates
      const validation = await validateNewRelease(
        values.name,
        artists,
        values.release_date,
        release?.id
      );

      if (!validation.isValid) {
        if (validation.error) {
          setError(validation.error);
          showToast({
            type: 'error',
            message: validation.error.message
          });
        }
        return false;
      }

      // Create or update release
      const releaseId = await createOrUpdateRelease(
        { 
          ...values, 
          created_by: user.id,
          description: values.description?.trim() || null,
          description_author_id: values.description?.trim() ? user.id : null
        },
        artists,
        release?.id
      );

      return releaseId;
    } catch (error) {
      console.error('Error saving release:', error);
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save release'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    error,
    handleSubmit
  };
}