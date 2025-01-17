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

      // First get the liked release IDs with their liked timestamps
      const { data: likedIds, error: likesError } = await fetchWithRetry(() =>
        supabase
          .from('release_likes')
          .select('release_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(isLoadMore ? releases.length : 0, (isLoadMore ? releases.length : 0) + PAGE_SIZE - 1)
      );

      if (likesError) throw likesError;

      if (!likedIds || likedIds.length === 0) {
        setHasMore(false);
        setLoading(false);
        if (!isLoadMore) {
          setReleases([]);
        }
        return;
      }

      // Then get the full release data for those IDs
      const { data: releasesData, error: releasesError } = await fetchWithRetry(() =>
        supabase
          .from('releases_view')
          .select('*')
          .in('id', likedIds.map(r => r.release_id))
      );

      if (releasesError) throw releasesError;

      if (!releasesData) {
        throw new Error('No release data returned');
      }

      // Create a map of release_id to created_at (like timestamp)
      const likeTimestamps = new Map(likedIds.map(l => [l.release_id, l.created_at]));
      
      // Sort releases by their like timestamp
      const sortedReleases = releasesData
        .map(release => ({
          ...release,
          liked_at: likeTimestamps.get(release.id)
        }))
        .sort((a, b) => {
          const aTime = new Date(a.liked_at || 0).getTime();
          const bTime = new Date(b.liked_at || 0).getTime();
          return bTime - aTime;
        });

      // Update state
      if (isLoadMore) {
        setReleases(prev => [...prev, ...sortedReleases]);
      } else {
        setReleases(sortedReleases);
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