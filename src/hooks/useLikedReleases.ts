import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Release } from '../types/database';
import { useAuth } from './useAuth';

export function useLikedReleases() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setReleases([]);
      setLoading(false);
      return;
    }

    async function fetchLikedReleases() {
      try {
        // First get the liked release IDs
        const { data: likedIds } = await supabase
          .from('release_likes')
          .select('release_id')
          .eq('user_id', user.id);

        if (!likedIds?.length) {
          setReleases([]);
          setLoading(false);
          return;
        }

        // Then fetch the full release data
        const { data: releases } = await supabase
          .from('releases')
          .select(`
            *,
            artists:release_artists(
              position,
              artist:artists(*)
            )
          `)
          .in('id', likedIds.map(row => row.release_id));

        if (releases) setReleases(releases);
      } catch (error) {
        console.error('Error fetching liked releases:', error);
        setReleases([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLikedReleases();
  }, [user]);

  return { releases, loading };
}