import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { useRetry } from './useRetry';

export function useSpotifyConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();
  const { executeWithRetry } = useRetry();

  useEffect(() => {
    if (!user) {
      setIsConnected(false);
      setLoading(false);
      return;
    }

    checkConnection();
  }, [user]);

  const checkConnection = async () => {
    try {
      const { data, error } = await executeWithRetry(() =>
        supabase
          .from('spotify_connections')
          .select('id')
          .eq('user_id', user?.id)
          .maybeSingle()
      );

      if (error) throw error;
      setIsConnected(data !== null);
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to check Spotify connection'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isConnected,
    loading,
    checkConnection
  };
}