import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Release } from '../types/database';
import { useToast } from './useToast';
import { useInView } from 'react-intersection-observer';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const PAGE_SIZE = 50;

export function useReleases() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
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

  const fetchReleases = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
      }

      const { data, error } = await fetchWithRetry(() =>
        supabase
          .from('releases_view')
          .select('*', { count: 'exact' })
          .order('release_date', { ascending: false })
          .range(isLoadMore ? releases.length : 0, (isLoadMore ? releases.length : 0) + PAGE_SIZE - 1)
      );

      if (error) throw error;

      if (isLoadMore) {
        setReleases(prev => [...prev, ...(data || [])]);
      } else {
        setReleases(data || []);
      }

      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (error) {
      console.error('[useReleases] Error fetching releases:', error);
      showToast({
        type: 'error',
        message: 'Unable to load releases. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [releases.length, showToast]);

  // Initial load
  useEffect(() => {
    fetchReleases();
  }, []);

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && !loading && hasMore) {
      console.log('Loading more releases...');
      fetchReleases(true);
    }
  }, [inView, loading, hasMore, fetchReleases]);

  return {
    releases,
    loading,
    hasMore,
    loadMoreRef: ref,
    refetch: () => fetchReleases()
  };
};