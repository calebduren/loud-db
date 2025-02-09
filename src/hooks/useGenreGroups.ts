import { useEffect, useState } from "react";
import { fetchGenreGroups } from "../lib/genres/genreService";
import { logger } from "../lib/utils/logger";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useGenreGroups() {
  const [genreGroups, setGenreGroups] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;

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
  }, []);

  return { genreGroups, loading, error };
}