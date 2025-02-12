import { useEffect, useState } from "react";
import { fetchGenreGroups } from "../lib/genres/genreService";
import { logger } from "../lib/utils/logger";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Cache for genre groups
let cachedGenreGroups: Record<string, string[]> | null = null;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useGenreGroups() {
  const [genreGroups, setGenreGroups] = useState<Record<string, string[]>>(cachedGenreGroups || {});
  const [loading, setLoading] = useState(!cachedGenreGroups);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;

    // If we have cached data, no need to fetch
    if (cachedGenreGroups) {
      return;
    }

    async function loadGenreGroups() {
      while (retryCount < MAX_RETRIES) {
        try {
          const groups = await fetchGenreGroups();
          
          // Check if we got any groups
          const groupCount = Object.keys(groups).length;
          if (groupCount === 0 && retryCount < MAX_RETRIES - 1) {
            retryCount++;
            await delay(RETRY_DELAY);
            continue;
          }

          if (mounted) {
            setGenreGroups(groups);
            setError(null);
            setLoading(false);
            // Cache the results
            cachedGenreGroups = groups;
          }
          return; // Success, exit retry loop
        } catch (err) {
          if (retryCount < MAX_RETRIES - 1) {
            retryCount++;
            await delay(RETRY_DELAY);
          } else {
            if (mounted) {
              setGenreGroups({});
              setError(err instanceof Error ? err : new Error('Failed to load genre groups'));
              setLoading(false);
            }
          }
        }
      }
    }

    loadGenreGroups();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array since we're using module-level cache

  return { genreGroups, loading, error };
}