import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useLikes(releaseId: string) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

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

  useEffect(() => {
    fetchLikes();
  }, [releaseId, user]);

  const fetchLikes = async () => {
    if (!releaseId) return;
    
    try {
      // Get total likes count
      const { count } = await fetchWithRetry(() =>
        supabase
          .from('release_likes')
          .select('*', { count: 'exact', head: true })
          .eq('release_id', releaseId)
      );

      setLikesCount(count || 0);

      // Check if current user liked the release
      if (user) {
        const { data } = await fetchWithRetry(() =>
          supabase
            .from('release_likes')
            .select('*')
            .eq('release_id', releaseId)
            .eq('user_id', user.id)
            .maybeSingle()
        );

        setIsLiked(!!data);
      }
    } catch (error) {
      console.error('[useLikes] Error fetching likes:', error);
      showToast({
        type: 'error',
        message: 'Unable to load like status'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!user) return;

    try {
      setLoading(true);
      if (isLiked) {
        await fetchWithRetry(() =>
          supabase
            .from('release_likes')
            .delete()
            .eq('release_id', releaseId)
            .eq('user_id', user.id)
        );
        
        setLikesCount(prev => prev - 1);
      } else {
        await fetchWithRetry(() =>
          supabase
            .from('release_likes')
            .insert({ release_id: releaseId, user_id: user.id })
        );
        
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('[useLikes] Error toggling like:', error);
      showToast({
        type: 'error',
        message: 'Unable to update like status'
      });
    } finally {
      setLoading(false);
    }
  };

  return { isLiked, likesCount, loading, toggleLike };
}