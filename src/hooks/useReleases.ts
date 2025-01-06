import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Release } from '../types/database';
import { useToast } from './useToast';

export function useReleases() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchReleases = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('releases_view')
        .select('*')
        .order('release_date', { ascending: false });

      if (error) throw error;
      setReleases(data || []);
    } catch (error) {
      console.error('[useReleases] Error fetching releases:', error);
      showToast({
        type: 'error',
        message: 'Unable to load releases. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  return {
    releases,
    loading,
    refetch: fetchReleases
  };
};