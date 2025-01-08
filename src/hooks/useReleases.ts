import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Release, ReleaseType } from '../types/database';
import { useToast } from './useToast';
import { useInView } from 'react-intersection-observer';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const INITIAL_PAGE_SIZE = 100;
const SUBSEQUENT_PAGE_SIZE = 50;

interface UseReleasesParams {
  selectedTypes?: (ReleaseType | 'all')[];
  selectedGenres?: string[];
  genreFilterMode?: 'include' | 'exclude';
  genreGroups?: Record<string, string[]>;
}

export function useReleases({ 
  selectedTypes = ['all'], 
  selectedGenres = [], 
  genreFilterMode = 'include',
  genreGroups = {} 
}: UseReleasesParams = {}) {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
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
      // Only set loading on initial fetch when no releases exist
      if (!isLoadMore && releases.length === 0) {
        setLoading(true);
      }

      let query = supabase
        .from('releases_view')
        .select('*', { count: 'exact' })
        .order('release_date', { ascending: false });

      // Apply type filter if not "all"
      if (!selectedTypes.includes('all')) {
        console.log('Applying type filter:', { selectedTypes });
        query = query.in('release_type', selectedTypes);
      }

      // Apply genre filter
      if (selectedGenres.length > 0) {
        const allGenres = selectedGenres.flatMap(groupName => genreGroups[groupName] || []);
        if (allGenres.length > 0) {
          if (genreFilterMode === 'include') {
            // Include mode: match releases that have any of the selected genres
            query = query.overlaps('genres', allGenres);
          } else {
            // Exclude mode: match releases that don't have any of the selected genres
            // Use not + overlaps to exclude any releases that have any of the selected genres
            query = query.not('genres', 'ov', `{${allGenres.join(',')}}`);
          }
        }
      }

      const pageSize = isLoadMore ? SUBSEQUENT_PAGE_SIZE : INITIAL_PAGE_SIZE;
      const startRange = isLoadMore ? releases.length : 0;
      const endRange = startRange + pageSize - 1;

      console.log('Fetching releases with params:', {
        selectedTypes,
        selectedGenres,
        genreFilterMode,
        allGenres: selectedGenres.flatMap(groupName => genreGroups[groupName] || []),
        startRange,
        endRange,
        isLoadMore
      });

      const { data, error, count } = await fetchWithRetry(() =>
        query.range(startRange, endRange)
      );

      if (error) throw error;

      console.log('Query results:', {
        count,
        resultsLength: data?.length || 0,
        hasMore: (data?.length || 0) === pageSize && (startRange + pageSize) < (count || 0)
      });

      // Batch all state updates in a single animation frame
      requestAnimationFrame(() => {
        if (isLoadMore) {
          setReleases(prev => [...prev, ...(data || [])]);
        } else {
          setReleases(data || []);
        }
        
        if (count !== null) {
          setTotalCount(count);
          setHasMore((data?.length || 0) === pageSize && (startRange + pageSize) < count);
        }
        
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching releases:', error);
      showToast({
        title: 'Error loading releases',
        description: 'Please try again later',
        type: 'error',
      });
    }
  }, [releases.length, selectedTypes, selectedGenres, genreFilterMode, genreGroups, showToast]);

  // Initial load
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
    loading,
    hasMore,
    totalCount,
    loadMoreRef: ref,
    refetch: useCallback(() => fetchReleases(), [fetchReleases]),
    loadMore: useCallback(() => fetchReleases(true), [fetchReleases]),
  };
}