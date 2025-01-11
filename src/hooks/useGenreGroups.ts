import { useState, useEffect } from 'react';
import { useToast } from './useToast';
import { fetchGenreGroups } from '../lib/genres/genreService';

const RETRY_DELAY = 2000; // 2 seconds between retries
const MAX_RETRIES = 3;

export function useGenreGroups() {
  const [groups, setGroups] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    let retryTimeout: NodeJS.Timeout;

    async function loadGroups() {
      try {
        const groupMap = await fetchGenreGroups();
        if (!mounted) return;

        console.log('Loaded genre groups:', groupMap);
        setGroups(groupMap);
        setError(null);

        // Only show error toast if we have no groups after retries
        if (Object.keys(groupMap).length === 0 && retryCount === MAX_RETRIES) {
          showToast({
            type: 'error',
            message: 'Unable to load genre groups. Some features may be limited.'
          });
        }
      } catch (err) {
        console.error('Error loading genre groups:', err);
        if (!mounted) return;

        if (retryCount < MAX_RETRIES) {
          retryCount++;
          retryTimeout = setTimeout(loadGroups, RETRY_DELAY * retryCount);
        } else {
          setError(err instanceof Error ? err : new Error('Failed to load genre data'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadGroups();

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [showToast]);

  // Create mapping of genre to group names
  const genreToGroups = Object.entries(groups).reduce((acc, [groupName, genres]) => {
    genres.forEach(genre => {
      if (!acc[genre]) acc[genre] = [];
      acc[genre].push(groupName);
    });
    return acc;
  }, {} as Record<string, string[]>);

  return {
    genreGroups: groups,
    loading,
    error,
    genreToGroups
  };
}