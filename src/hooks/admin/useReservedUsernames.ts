import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../useToast';

interface ReservedUsername {
  username: string;
  reason: string;
  created_at: string;
}

export function useReservedUsernames() {
  const [usernames, setUsernames] = useState<ReservedUsername[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsernames();
  }, []);

  const fetchUsernames = async () => {
    try {
      const { data, error } = await supabase
        .from('reserved_usernames')
        .select('*')
        .order('username');

      if (error) throw error;
      setUsernames(data || []);
    } catch (err) {
      console.error('Error fetching reserved usernames:', err);
      setError('Failed to load reserved usernames');
    } finally {
      setLoading(false);
    }
  };

  const addUsername = async (username: string) => {
    try {
      const { error } = await supabase
        .from('reserved_usernames')
        .insert({ 
          username: username.toLowerCase(),
          reason: 'Manually reserved'
        });

      if (error) throw error;

      showToast({
        type: 'success',
        message: 'Username reserved successfully'
      });

      await fetchUsernames();
    } catch (err) {
      console.error('Error reserving username:', err);
      showToast({
        type: 'error',
        message: 'Failed to reserve username'
      });
    }
  };

  const removeUsername = async (username: string) => {
    try {
      const { error } = await supabase
        .from('reserved_usernames')
        .delete()
        .eq('username', username);

      if (error) throw error;

      showToast({
        type: 'success',
        message: 'Username unreserved successfully'
      });

      await fetchUsernames();
    } catch (err) {
      console.error('Error removing reserved username:', err);
      showToast({
        type: 'error',
        message: 'Failed to remove reserved username'
      });
    }
  };

  return {
    usernames,
    loading,
    error,
    addUsername,
    removeUsername
  };
}