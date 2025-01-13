import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Release } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './useToast';
import { useInView } from 'react-intersection-observer';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const PAGE_SIZE = 50;

export function useLikedReleases() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px'
  });

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

  const fetchLikedReleases = async (isLoadMore = false) => {
    if (!user) {
      setReleases([]);
      setLoading(false);
      return;
    }

    try {
      if (!isLoadMore) {
        setLoading(true);
      }

      console.log('Fetching liked releases for user:', user.id);

      // First get the liked release IDs
      const { data: likedIds } = await fetchWithRetry(() =>
        supabase
          .from('release_likes')
          .select('release_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(isLoadMore ? releases.length : 0, (isLoadMore ? releases.length : 0) + PAGE_SIZE - 1)
      );

      console.log('Found liked IDs:', likedIds?.length);

      if (!likedIds?.length) {
        if (!isLoadMore) {
          setReleases([]);
        }
        setHasMore(false);
        setLoading(false);
        return;
      }

      // Then fetch the full release data
      const { data: releasesData } = await fetchWithRetry(() =>
        supabase
          .from('releases_view')
          .select('*')
          .in('id', likedIds.map(row => row.release_id))
      );

      console.log('Fetched releases data:', releasesData?.length);

      if (releasesData) {
        // Sort releases to match the order of likes
        const releasesMap = new Map(releasesData.map(r => [r.id, r]));
        const sortedReleases = likedIds
          .map(like => releasesMap.get(like.release_id))
          .filter((r): r is Release => r !== undefined);

        if (isLoadMore) {
          setReleases(prev => [...prev, ...sortedReleases]);
        } else {
          setReleases(sortedReleases);
        }
      }

      setHasMore(likedIds.length === PAGE_SIZE);
    } catch (error) {
      console.error('[useLikedReleases] Error fetching liked releases:', error);
      showToast({
        type: 'error',
        message: 'Unable to load liked releases. Please try again.'
      });
      if (!isLoadMore) {
        setReleases([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLikedReleases();
  }, [user]);

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && !loading && hasMore) {
      console.log('Loading more liked releases...');
      fetchLikedReleases(true);
    }
  }, [inView, loading, hasMore]);

  return {
    releases,
    loading,
    hasMore,
    loadMoreRef: ref,
    refetch: () => fetchLikedReleases()
  };
};