import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Release } from '../types/database';
import { useToast } from './useToast';
import { usePermissions } from './usePermissions';
import { fetchWithRetry } from '../lib/utils/fetchUtils';
import { useInView } from 'react-intersection-observer';

const PAGE_SIZE = 50;

export function useUserReleases(userId?: string) {
  const [releases, setReleases] = useState<Release[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();
  const { canManageReleases } = usePermissions();
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px'
  });

  const fetchReleases = useCallback(async (isLoadMore = false) => {
    if (!userId || !canManageReleases) {
      setReleases([]);
      setCount(0);
      setHasMore(false);
      setLoading(false);
      return;
    }

    try {
      if (!isLoadMore) {
        setLoading(true);
      }

      // Get the current length inside the callback to avoid stale closure
      const currentLength = isLoadMore ? releases.length : 0;

      // Get releases with retry logic
      const { data, error: fetchError, count: totalCount } = await fetchWithRetry(() =>
        supabase
          .from('releases_view')
          .select('*', { count: 'exact' })
          .eq('created_by', userId)
          .order('created_at', { ascending: false })
          .range(currentLength, currentLength + PAGE_SIZE - 1)
      );

      if (fetchError) throw fetchError;

      // Update releases and hasMore
      if (data) {
        if (isLoadMore) {
          setReleases(prev => [...prev, ...data]);
        } else {
          setReleases(data);
        }
        setCount(totalCount || 0);
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      setError(err as Error);
      showToast({
        title: 'Error loading releases',
        description: 'Please try again later',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, canManageReleases, releases.length, showToast]);

  // Initial fetch
  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  // Load more when scrolling
  useEffect(() => {
    if (inView && !loading && hasMore) {
      fetchReleases(true);
    }
  }, [inView, loading, hasMore, fetchReleases]);

  return {
    releases,
    count,
    loading,
    hasMore,
    error,
    loadMoreRef: ref,
  };
}