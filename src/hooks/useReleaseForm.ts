import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, FormValues } from '../components/admin/forms/releaseFormSchema';
import { Release } from '../types/database';
import { ArtistData } from '../types/forms';
import { useAuth } from '../contexts/AuthContext';
import { createOrUpdateRelease } from '../lib/releases/releaseService';
import { toast } from 'sonner';

export function useReleaseForm(release?: Release) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReleaseValidationError | null>(null);
  const { user } = useAuth();

  // Load initial form state from localStorage or defaults
  const getInitialValues = () => {
    if (release) {
      return {
        name: release.name,
        release_type: release.release_type,
        cover_url: release.cover_url || '',
        genres: release.genres || [], // Ensure genres is always an array
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
        const parsed = JSON.parse(savedForm);
        return {
          ...parsed,
          genres: parsed.genres || [], // Ensure genres is always an array
        };
      } catch (e) {
        console.error('Error parsing saved form:', e);
      }
    }

    return {
      name: '',
      release_type: 'single',
      cover_url: '',
      genres: [], // Initialize with empty array
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

  const handleSubmit = async (values: FormValues, artists: ArtistData[]) => {
    try {
      setLoading(true);
      setError(null);

      // Create or update release
      const releaseId = await createOrUpdateRelease({
        ...values,
        created_by: user?.id || ''
      }, artists, release);

      // Let the component handle success toasts
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
    error,
    handleSubmit,
    reset,
  };
}