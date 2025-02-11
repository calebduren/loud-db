import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../../lib/supabase';
import { formSchema, FormValues } from './releaseFormSchema';
import { Release } from '../../../types/database';
import { AuthContext } from "../../../contexts/AuthContext";
import { filterValidGenres } from '../../../lib/utils/genreUtils';
import { checkDuplicateRelease } from '../../../lib/releases/validation';
import { toast } from 'sonner';

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

  const handleSubmit = async (values: FormValues, artistIds: string[]) => {
    try {
      setLoading(true);
      setError(null);

      // Validate the release data
      const validation = await validateNewRelease(values, artistIds);
      if (!validation.isValid) {
        if (validation.error) {
          setError(validation.error);
          toast.error(validation.error.message, {
            position: 'top-center'
          });
          return;
        }
      }

      // Create or update release
      const releaseId = await createOrUpdateRelease({
        ...values,
        created_by: user?.id || ''
      }, artistIds.map(id => ({ id })), release);

      toast.success(release ? "Release updated successfully" : "Release created successfully", {
        position: 'top-center'
      });

      return releaseId;
    } catch (error) {
      console.error('Error saving release:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save release', {
        position: 'top-center'
      });
      throw error;
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