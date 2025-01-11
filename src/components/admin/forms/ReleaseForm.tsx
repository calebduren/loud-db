import React, { useCallback, useState, useEffect } from 'react';
import { Release } from '../../../types/database';
import { ReleaseFormTabs } from './ReleaseFormTabs';
import { SpotifyImportSection } from '../SpotifyImportSection';
import { Button } from '../../ui/button';
import { Form } from '../../ui/form';
import { Music, Loader2 } from 'lucide-react';
import { useReleaseForm } from '../../../hooks/useReleaseForm';
import { useArtistSelection } from './useArtistSelection';
import { useArtists } from '../../../hooks/useArtists';
import { SpotifyReleaseData } from '../../../lib/spotify/types';
import { validateArtists } from '../../../lib/releases/validation';
import { DuplicateReleaseError } from '../../releases/DuplicateReleaseError';
import { useToast } from '../../../hooks/useToast';
import { useUser } from '../../../hooks/useUser';

interface ReleaseFormProps {
  release?: Release;
  onSuccess?: (release: Release) => void;
  onClose?: () => void;
}

export function ReleaseForm({ release, onSuccess, onClose }: ReleaseFormProps) {
  const { form, loading, error, handleSubmit: originalHandleSubmit } = useReleaseForm(release);
  const { artists } = useArtists();
  const { showToast } = useToast();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    selectedArtists,
    setSelectedArtists,
    handleArtistChange,
    addArtist,
    removeArtist
  } = useArtistSelection(
    release?.artists.sort((a, b) => a.position - b.position)
      .map(ra => ({ id: ra.artist.id, name: ra.artist.name })) || 
    [{ name: '' }]
  );

  // Initialize form with release data if editing
  React.useEffect(() => {
    if (release) {
      const formData = {
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
        tracks: release.tracks || []
      };
      
      form.reset(formData);
      
      setSelectedArtists(
        release.artists
          .sort((a, b) => a.position - b.position)
          .map(ra => ({ id: ra.artist.id, name: ra.artist.name }))
      );
    } 
  }, [release, form]);

  const handleSpotifyImport = useCallback((importedData: SpotifyReleaseData) => {
    const formData = {
      name: importedData.name,
      artists: importedData.artists.map(a => ({ name: a.name })),
      release_type: importedData.releaseType,
      cover_url: importedData.coverUrl,
      genres: importedData.genres,
      record_label: importedData.recordLabel,
      track_count: importedData.trackCount,
      spotify_url: importedData.spotify_url,
      release_date: new Date(new Date(importedData.releaseDate).getTime() + new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
      tracks: importedData.tracks
    };

    form.reset(formData);
    setSelectedArtists(importedData.artists.map(artist => ({
      name: artist.name
    })));
  }, [form, setSelectedArtists]);

  const handleFormSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading || isSubmitting) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const values = form.getValues();
      const formIsValid = await form.trigger();
      
      if (!formIsValid) {
        return;
      }
      
      const artistError = validateArtists(selectedArtists);
      if (artistError) {
        form.setError('name', { message: artistError });
        return;
      }
      
      const releaseId = await originalHandleSubmit(values, selectedArtists);
      if (releaseId) {
        // Create the release object, preserving existing ID if updating
        const newRelease: Release = {
          id: release?.id || releaseId,
          ...values,
          created_by: release?.created_by || user?.id || '',
          created_at: release?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          artists: selectedArtists.map((a, index) => ({
            position: index,
            artist: {
              id: a.id || '',
              name: a.name,
              image_url: a.image_url || null
            }
          }))
        };

        // Close modal first
        onClose?.();
        
        // Update UI optimistically
        onSuccess?.(newRelease);

        // Show toast last
        showToast({
          type: 'success',
          message: release ? 'Release updated successfully' : 'Release created successfully',
          action: !release ? {
            label: 'View Release',
            onClick: () => {
              setTimeout(() => {
                const releaseModal = document.querySelector(`[data-release-id="${releaseId}"]`);
                if (releaseModal) {
                  releaseModal.dispatchEvent(new MouseEvent('click'));
                }
              }, 100);
            }
          } : undefined,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast({
        type: 'error',
        message: 'Failed to save release. Please try again.',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Error Display */}
        {error?.code === 'DUPLICATE_RELEASE' ? (
          <DuplicateReleaseError error={error} />
        ) : (
          Object.keys(form.formState.errors).length > 0 && (
            <div className="text-red-500 text-sm space-y-1">
              {Object.entries(form.formState.errors).map(([key, error]) => (
                <p key={key}>{error?.message?.toString() || `Invalid ${key}`}</p>
              ))}
            </div>
          )
        )}

        <SpotifyImportSection 
          onImport={handleSpotifyImport}
          disabled={loading || isSubmitting}
        />

        <ReleaseFormTabs
          form={form}
          selectedArtists={selectedArtists}
          artistOptions={artists}
          onArtistChange={handleArtistChange}
          onAddArtist={addArtist}
          onRemoveArtist={removeArtist}
        />

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleFormSubmit}
            disabled={loading || isSubmitting}
            className="flex items-center gap-2"
          >
            {loading || isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {release ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                {release ? 'Save Changes' : 'Create Release'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Form>
  );
}