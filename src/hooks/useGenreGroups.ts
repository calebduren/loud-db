import { useEffect, useState } from "react";
import { fetchGenreGroups } from "../lib/genres/genreService";
import { logger } from "../lib/utils/logger";

export function useGenreGroups() {
  const [genreGroups, setGenreGroups] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadGenreGroups() {
      try {
        logger.debug('Loading genre groups');
        const groups = await fetchGenreGroups();
        if (mounted) {
          setGenreGroups(groups);
          setLoading(false);
        }
      } catch (error) {
        logger.error('Error loading genre groups', { error });
        if (mounted) {
          setGenreGroups({});
          setLoading(false);
        }
      }
    }

    loadGenreGroups();

    return () => {
      mounted = false;
    };
  }, []);

  return { genreGroups, loading };
}