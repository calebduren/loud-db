import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Release } from '../types/database';
import { useToast } from './useToast';
import { usePermissions } from './usePermissions';
import { fetchWithRetry } from '../lib/utils/fetchUtils';

export function useUserReleases(userId?: string) {
  const [releases, setReleases] = useState<Release[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();
  const { canManageReleases } = usePermissions();

  const fetchReleases = async () => {
    if (!userId || !canManageReleases) {
      setReleases([]);
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      // Get releases with retry logic
      const { data, error: fetchError } = await fetchWithRetry(() =>
        supabase
          .from('releases_view')
          .select('*')
          .eq('created_by', userId)
          .order('created_at', { ascending: false })
      );

      if (fetchError) throw fetchError;

      // Set the releases
      setReleases(data || []);
      setCount(data?.length || 0);
      setError(null);
    } catch (err) {
      console.error('Error in useUserReleases:', err);
      const message = err instanceof Error ? err.message : 'Failed to load releases';
      setError(new Error(message));
      showToast({
        type: 'error',
        message
      });
      setReleases([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, [userId, canManageReleases]);

  return { 
    releases, 
    count, 
    loading, 
    error,
    refetch: fetchReleases 
  };
}