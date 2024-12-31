import React, { useState } from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { scrapeAllMusicNewReleases } from '../../lib/scraper/allmusic';
import { importRelease } from '../../lib/scraper/importRelease';
import { useAuth } from '../../hooks/useAuth';
import { useRateLimit } from '../../hooks/useRateLimit';
import { useToast } from '../../hooks/useToast';

export function ImportButton() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const { user } = useAuth();
  const { isAllowed, checkLimit, formattedTime } = useRateLimit(
    `import-${user?.id}`,
    { windowMs: 5 * 60 * 1000, maxAttempts: 2 }
  );
  const { showToast } = useToast();

  const handleImport = async () => {
    if (!user || !checkLimit()) return;
    setImporting(true);
    setProgress(null);

    try {
      const result = await scrapeAllMusicNewReleases();
      
      if (!result.success || !result.releases.length) {
        throw new Error(result.error || 'No releases found');
      }

      let successCount = 0;
      for (let i = 0; i < result.releases.length; i++) {
        setProgress({ current: i + 1, total: result.releases.length });
        const success = await importRelease(result.releases[i], user.id);
        if (success) successCount++;
      }

      if (successCount === 0) {
        showToast({
          type: 'error',
          message: 'Failed to import any releases. Please try again later.'
        });
      } else {
        showToast({
          type: 'success',
          message: `Successfully imported ${successCount} of ${result.releases.length} releases!`
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to import releases'
      });
    } finally {
      setImporting(false);
      setProgress(null);
    }
  };

  if (!isAllowed) {
    return (
      <div className="relative group">
        <button
          disabled
          className="btn btn-secondary flex items-center gap-2 opacity-50 cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Import New Releases
        </button>
        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black/90 text-white text-sm rounded-md p-2 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            Rate limit exceeded. Try again in {formattedTime}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleImport}
      disabled={importing}
      className="btn btn-secondary flex items-center gap-2"
    >
      {importing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {progress 
            ? `Importing ${progress.current}/${progress.total}...`
            : 'Preparing import...'}
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Import New Releases
        </>
      )}
    </button>
  );
}