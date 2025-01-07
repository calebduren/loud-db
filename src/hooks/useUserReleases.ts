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
      setHasMore(false);
      setLoading(false);
      return;
    }

    try {
      if (!isLoadMore) {
        setLoading(true);
      }

      // Get releases with retry logic
      const { data, error: fetchError } = await fetchWithRetry(() =>
        supabase
          .from('releases_view')
          .select('*', { count: 'exact' })
          .eq('created_by', userId)
          .order('created_at', { ascending: false })
          .range(isLoadMore ? releases.length : 0, (isLoadMore ? releases.length : 0) + PAGE_SIZE - 1)
      );

      if (fetchError) throw fetchError;

      // Update releases and hasMore
      if (isLoadMore) {
        setReleases(prev => [...prev, ...(data || [])]);
      } else {
        setReleases(data || []);
      }
      setHasMore((data?.length || 0) === PAGE_SIZE);
      setError(null);
    } catch (err) {
      console.error('Error in useUserReleases:', err);
      const message = err instanceof Error ? err.message : 'Failed to load releases';
      setError(new Error(message));
      showToast({
        type: 'error',
        message
      });
      if (!isLoadMore) {
        setReleases([]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, canManageReleases, releases.length, showToast]);

  // Initial fetch
  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && !loading && hasMore) {
      fetchReleases(true);
    }
  }, [inView, loading, hasMore, fetchReleases]);

  return {
    releases,
    loading,
    error,
    hasMore,
    loadMoreRef: ref,
    refetch: () => fetchReleases()
  };
}