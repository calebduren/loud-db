import React, { useState } from 'react';
import { Music, Loader2 } from 'lucide-react';
import { fetchReleaseFromSpotify } from '../../lib/spotify/client';
import { importRelease } from '../../lib/scraper/importRelease';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function SpotifyImportButton() {
  const [importing, setImporting] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const [url, setUrl] = useState('');

  const handleImport = async () => {
    if (!user || !url) return;
    setImporting(true);

    try {
      const release = await fetchReleaseFromSpotify(url);
      const success = await importRelease(release, user.id);

      if (success) {
        showToast({
          type: 'success',
          message: 'Release imported successfully!'
        });
        setUrl('');
      } else {
        throw new Error('Failed to import release');
      }
    } catch (error) {
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to import release'
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="spotify-url" className="text-white/60">
          Import from Spotify
        </Label>
        <Input
          id="spotify-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste Spotify album URL"
        />
      </div>
      <button
        onClick={handleImport}
        disabled={importing || !url}
        className="btn btn-primary h-10 flex items-center gap-2 whitespace-nowrap px-4"
      >
        {importing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Music className="w-4 h-4" />
            Import
          </>
        )}
      </button>
    </div>
  );
}