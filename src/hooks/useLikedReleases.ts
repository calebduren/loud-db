import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Release } from '../types/database';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useLikedReleases() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchWithRetry = async (fn: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(fn, retries - 1);
      }
      throw error;
    }
  };

  useEffect(() => {
    if (!user) {
      setReleases([]);
      setLoading(false);
      return;
    }

    async function fetchLikedReleases() {
      try {
        // First get the liked release IDs
        const { data: likedIds } = await fetchWithRetry(() =>
          supabase
            .from('release_likes')
            .select('release_id')
            .eq('user_id', user.id)
        );

        if (!likedIds?.length) {
          setReleases([]);
          setLoading(false);
          return;
        }

        // Then fetch the full release data
        const { data: releases } = await fetchWithRetry(() =>
          supabase
            .from('releases_view')
            .select('*')
            .in('id', likedIds.map(row => row.release_id))
        );

        if (releases) setReleases(releases);
      } catch (error) {
        console.error('[useLikedReleases] Error fetching liked releases:', error);
        showToast({
          type: 'error',
          message: 'Unable to load liked releases. Please try again.'
        });
        setReleases([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLikedReleases();
  }, [user]);

  return { releases, loading };
}