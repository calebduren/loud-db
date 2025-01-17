import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Release } from '../types/database';
import { useToast } from './useToast';
import { usePermissions } from './usePermissions';
import { fetchWithRetry } from '../lib/utils/fetchUtils';
import { useInView } from 'react-intersection-observer';
import { useReleaseSubscription } from './useReleaseSubscription';

const PAGE_SIZE = 50;

// Helper function to sort releases
const sortReleases = (releases: Release[]) => {
  return [...releases].sort((a, b) => {
    // First sort by created_at
    const dateCompare = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (dateCompare !== 0) return dateCompare;
    // Then by id if dates are equal
    return b.id - a.id;
  });
};

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
      // Only set loading on initial fetch
      if (!isLoadMore && releases.length === 0) {
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
          .order('id', { ascending: false })  // Secondary sort by id to ensure consistent order
          .range(currentLength, currentLength + PAGE_SIZE - 1)
      );

      if (fetchError) throw fetchError;

      // Batch state updates
      const updates = () => {
        if (isLoadMore) {
          setReleases(prev => [...prev, ...(data || [])]);
        } else {
          setReleases(data || []);
        }
        if (totalCount !== null) {
          setCount(totalCount);
          setHasMore((data?.length || 0) === PAGE_SIZE && (currentLength + PAGE_SIZE) < totalCount);
        }
        setLoading(false);
      };
      
      // Use requestAnimationFrame to batch updates
      requestAnimationFrame(updates);
    } catch (err) {
      setError(err as Error);
      showToast({
        title: 'Error loading releases',
        description: 'Please try again later',
        type: 'error',
      });
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

  // Subscribe to changes, but only refetch if it's a relevant change
  useReleaseSubscription(() => {
    // Only refetch if we're not already loading and have a valid user
    if (!loading && userId && canManageReleases) {
      fetchReleases();
    }
  });

  return {
    releases,
    count,
    loading,
    hasMore,
    error,
    loadMoreRef: ref,
    refetch: () => fetchReleases(false)
  };
}