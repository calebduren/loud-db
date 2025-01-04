import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { fetchPlaylistAlbums } from '../../lib/spotify/playlist';
import { fetchReleaseFromSpotify } from '../../lib/spotify/client';
import { createRelease } from '../../lib/releases/createRelease';
import { useAuth } from '../../hooks/useAuth';
import { SpotifyAlbum } from '../../lib/spotify/types/album';
import { AppError } from '../../lib/errors/messages';
import { uploadImageFromUrl } from '../../lib/storage/images';

interface PlaylistImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportProgress {
  stage: 'fetching' | 'importing';
  current: number;
  total: number;
  currentAlbum?: string;
  errors: string[];
}

// Helper function to delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry failed requests
async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs);
      return retry(fn, retries - 1, delayMs * 2);
    }
    throw error;
  }
}

export function PlaylistImportModal({ isOpen, onClose, onSuccess }: PlaylistImportModalProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    stage: 'fetching',
    current: 0,
    total: 0,
    errors: []
  });
  const { user } = useAuth();

  const handleImport = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setProgress({
        stage: 'fetching',
        current: 0,
        total: 0,
        errors: []
      });
      
      // Fetch all albums from playlist
      const albums = await fetchPlaylistAlbums(url);
      
      setProgress(prev => ({
        ...prev,
        stage: 'importing',
        current: 0,
        total: albums.length
      }));

      // Process albums in batches of 5
      const batchSize = 5;
      const errors: string[] = [];

      for (let i = 0; i < albums.length; i += batchSize) {
        const batch = albums.slice(i, i + batchSize);
        
        // Process batch in parallel with rate limiting
        await Promise.all(
          batch.map(async (album, batchIndex) => {
            try {
              // Add a small delay between requests in the same batch
              await delay(batchIndex * 200);

              setProgress(prev => ({
                ...prev,
                currentAlbum: album.name
              }));

              // Get full album data with retries
              const releaseData = await retry(
                () => fetchReleaseFromSpotify(`https://open.spotify.com/album/${album.id}`)
              );
              
              // Upload album artwork to Supabase
              let coverUrl = releaseData.coverUrl;
              try {
                if (coverUrl) {
                  // Use a more organized path structure with release name
                  const safeName = releaseData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                  const path = `${album.id}-${safeName}.jpg`;
                  coverUrl = await uploadImageFromUrl(coverUrl, path);
                }
              } catch (error) {
                console.error('Failed to upload album artwork:', error);
                // Continue with Spotify CDN URL if upload fails
              }
              
              // Create release with retries
              await retry(
                () => createRelease({
                  name: releaseData.name,
                  artists: releaseData.artists.map(a => ({ name: a.name })),
                  release_type: releaseData.releaseType,
                  cover_url: coverUrl,
                  genres: releaseData.genres,
                  record_label: releaseData.recordLabel,
                  track_count: releaseData.trackCount,
                  spotify_url: `https://open.spotify.com/album/${album.id}`,
                  release_date: releaseData.releaseDate,
                  created_by: user.id,
                  tracks: releaseData.tracks.map(track => ({
                    name: track.name,
                    duration_ms: track.duration_ms,
                    track_number: track.track_number,
                    preview_url: track.preview_url
                  }))
                })
              );

              setProgress(prev => ({
                ...prev,
                current: prev.current + 1,
                currentAlbum: undefined
              }));
            } catch (error) {
              const errorMessage = `Failed to import "${album.name}": ${error instanceof Error ? error.message : 'Unknown error'}`;
              console.error(errorMessage, error);
              errors.push(errorMessage);
              
              setProgress(prev => ({
                ...prev,
                errors: [...prev.errors, errorMessage],
                current: prev.current + 1,
                currentAlbum: undefined
              }));
            }
          })
        );

        // Add a delay between batches to avoid rate limits
        if (i + batchSize < albums.length) {
          await delay(1000);
        }
      }

      if (errors.length === albums.length) {
        throw new Error('Failed to import any albums from the playlist');
      }

      onSuccess();
      if (errors.length === 0) {
        onClose();
      }
    } catch (error) {
      if (error instanceof AppError) {
        if (error.message === 'NOT_FOUND') {
          alert('Playlist not found. Please check the URL and make sure the playlist is public.');
        } else if (error.message === 'INVALID_URL') {
          alert('Invalid Spotify playlist URL. Please make sure you\'re using a valid Spotify playlist link.');
        } else if (error.message.includes('editorial playlist')) {
          alert(error.message);
        } else {
          alert('Failed to import playlist. Please try again later.');
        }
      } else {
        alert('Failed to import playlist. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Spotify Playlist"
      description="Enter a Spotify playlist URL to import all albums from that playlist."
    >
      <div className="space-y-4">
        <Input
          placeholder="Spotify playlist URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
          disabled={loading}
        />

        {loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>
                {progress.stage === 'fetching' ? 'Fetching playlist...' : 
                  `Importing ${progress.current} of ${progress.total} albums`}
              </span>
              {progress.currentAlbum && (
                <span>Current: {progress.currentAlbum}</span>
              )}
            </div>
            
            {/* Progress bar */}
            {progress.total > 0 && (
              <div className="w-full bg-white/10 rounded-full h-2.5">
                <div
                  className="bg-white/60 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            )}

            {/* Error list */}
            {progress.errors.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-white/60">
                  Failed to import {progress.errors.length} albums:
                </h3>
                <div className="text-sm text-red-400 max-h-32 overflow-y-auto space-y-1">
                  {progress.errors.map((error, i) => (
                    <div key={i}>{error}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {progress.errors.length > 0 ? 'Close' : 'Cancel'}
          </Button>
          <Button
            onClick={handleImport}
            disabled={loading || !url.trim()}
          >
            Import
          </Button>
        </div>
      </div>
    </Modal>
  );
}
