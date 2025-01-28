import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, FormValues } from '../components/admin/forms/releaseFormSchema';
import { Release } from '../types/database';
import { ArtistData } from '../types/forms';
import { useAuth } from '../contexts/AuthContext';
import { createOrUpdateRelease } from '../lib/releases/releaseService';
import { validateNewRelease } from '../lib/validation/releaseValidation';
import { ReleaseValidationError } from '../lib/errors/releaseErrors';
import { useToast } from './useToast';

export function useReleaseForm(release?: Release) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReleaseValidationError | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Load initial form state from localStorage or defaults
  const getInitialValues = () => {
    if (release) {
      return {
        name: release.name,
        release_type: release.release_type,
        cover_url: release.cover_url || '',
        genres: release.genres,
        record_label: release.record_label || '',
        track_count: release.track_count,
        spotify_url: release.spotify_url || '',
        apple_music_url: release.apple_music_url || '',
        release_date: new Date(release.release_date).toISOString().split('T')[0],
        description: release.description || '',
        tracks: release.tracks || [],
        related_artists: []
      };
    }

    const savedForm = localStorage.getItem('releaseFormDraft');
    if (savedForm) {
      try {
        return JSON.parse(savedForm);
      } catch (e) {
        console.error('Error parsing saved form:', e);
      }
    }

    return {
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
    };
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues()
  });

  const reset = useCallback(() => {
    form.reset({
      name: '',
      release_type: 'single',
      cover_url: '',
      genres: [],
      record_label: '',
      track_count: 0,
      spotify_url: '',
      apple_music_url: '',
      release_date: new Date().toISOString().split('T')[0],
      description: '',
      tracks: []
    });
  }, [form]);

  // Save form state to localStorage whenever it changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('releaseFormDraft', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
        release
      );

      // Clear saved form data after successful submission
      localStorage.removeItem('releaseFormDraft');

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
    handleSubmit,
    reset,
  };
}