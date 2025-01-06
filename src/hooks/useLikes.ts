import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Global store for likes data
type LikesStore = {
  counts: Map<string, number>;
  userLikes: Map<string, boolean>;
  loading: boolean;
  initialized: boolean;
};

const store: LikesStore = {
  counts: new Map(),
  userLikes: new Map(),
  loading: false,
  initialized: false,
};

// Function to fetch all likes data
async function fetchAllLikes(userId: string | undefined) {
  if (store.loading) return;
  store.loading = true;

  try {
    // Get all like counts in a single query
    const { data: likeCounts } = await supabase
      .rpc('get_release_like_counts');

    if (likeCounts) {
      store.counts.clear();
      likeCounts.forEach((item: { release_id: string; count: number }) => {
        store.counts.set(item.release_id, item.count);
      });
    }

    // If user is logged in, get their likes in a single query
    if (userId) {
      const { data: userLikes } = await supabase
        .from('release_likes')
        .select('release_id')
        .eq('user_id', userId);

      store.userLikes.clear();
      if (userLikes) {
        userLikes.forEach((like: any) => {
          store.userLikes.set(like.release_id, true);
        });
      }
    }

    store.initialized = true;
  } catch (error) {
    console.error('[fetchAllLikes] Error:', error);
  } finally {
    store.loading = false;
  }
}

export function useLikes(releaseId: string) {
  const [isLiked, setIsLiked] = useState(() => store.userLikes.get(releaseId) || false);
  const [likesCount, setLikesCount] = useState(() => store.counts.get(releaseId) || 0);
  const [loading, setLoading] = useState(!store.initialized);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Initial fetch of likes data
  useEffect(() => {
    const initializeLikes = async () => {
      if (!store.initialized && !store.loading) {
        await fetchAllLikes(user?.id);
        // Update state after initial fetch
        setIsLiked(store.userLikes.get(releaseId) || false);
        setLikesCount(store.counts.get(releaseId) || 0);
      }
    };
    
    initializeLikes();
  }, [user, releaseId]);

  // Set up realtime subscription for likes
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('likes-changes');
    
    // Subscribe to release_likes changes
    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'release_likes' },
        async () => {
          // Refetch all likes data when any changes occur
          await fetchAllLikes(user?.id);
          // Update component state
          setLikesCount(store.counts.get(releaseId) || 0);
          setIsLiked(store.userLikes.get(releaseId) || false);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, releaseId]);

  // Update local state when store changes
  useEffect(() => {
    if (store.initialized) {
      setLikesCount(store.counts.get(releaseId) || 0);
      setIsLiked(store.userLikes.get(releaseId) || false);
      setLoading(false);
    }
  }, [releaseId, store.initialized]);

  const toggleLike = async () => {
    if (!user || !releaseId) return;

    try {
      setLoading(true);
      if (isLiked) {
        await supabase
          .from('release_likes')
          .delete()
          .eq('release_id', releaseId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('release_likes')
          .insert({ release_id: releaseId, user_id: user.id });
      }
      
      // Optimistically update the UI
      const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
      setLikesCount(newLikesCount);
      setIsLiked(!isLiked);
      
      // The realtime subscription will handle updating the store
    } catch (error) {
      console.error('[useLikes] Error toggling like:', error);
      showToast({
        type: 'error',
        message: 'Unable to update like status'
      });
      
      // Revert optimistic updates on error
      setLikesCount(store.counts.get(releaseId) || 0);
      setIsLiked(store.userLikes.get(releaseId) || false);
    } finally {
      setLoading(false);
    }
  };

  return { isLiked, likesCount, loading, toggleLike };
}