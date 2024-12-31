import React, { useState } from 'react';
import { Music, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import { fetchReleaseFromSpotify } from '../../lib/spotify/client';
import { SpotifyReleaseData } from '../../lib/spotify/types';
import { useToast } from '../../hooks/useToast';
import { validateSpotifyUrl } from '../../lib/spotify/validation';

interface SpotifyImportSectionProps {
  onImport: (data: SpotifyReleaseData) => void;
  disabled?: boolean;
}

export function SpotifyImportSection({ onImport, disabled }: SpotifyImportSectionProps) {
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleImport = async () => {
    setError(null);

    // Validate URL format
    const validation = validateSpotifyUrl(url);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setImporting(true);

    try {
      const release = await fetchReleaseFromSpotify(url);
      onImport(release);
      setUrl('');
      showToast({
        type: 'success',
        message: 'Release imported successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import release';
      setError(message);
      showToast({
        type: 'error',
        message
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4 mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="spotify-url">Import from Spotify</Label>
          <Input
            id="spotify-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Spotify album URL"
            disabled={disabled || importing}
          />
        </div>
        <Button
          onClick={handleImport}
          disabled={disabled || importing || !url}
          className="h-10 whitespace-nowrap"
        >
          {importing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Importing...</span>
            </>
          ) : (
            <>
              <Music className="w-4 h-4 mr-2" />
              <span>Import</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}