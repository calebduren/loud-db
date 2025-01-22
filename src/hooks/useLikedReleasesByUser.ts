import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Release } from '../types/database';

export function useLikedReleasesByUser(userId?: string) {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setReleases([]);
      setLoading(false);
      return;
    }

    async function fetchLikedReleases() {
      try {
        const { data: likedIds } = await supabase
          .from('release_likes')
          .select('release_id, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!likedIds?.length) {
          setReleases([]);
          return;
        }

        const { data: releases } = await supabase
          .from('releases_view')
          .select('*')
          .in('id', likedIds.map(row => row.release_id));

        if (releases) {
          const orderedReleases = likedIds
            .map(like => releases.find(release => release.id === like.release_id))
            .filter((release): release is Release => release !== undefined);
          setReleases(orderedReleases);
        }
      } catch (error) {
        console.error('Error fetching liked releases:', error);
        setReleases([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLikedReleases();
  }, [userId]);

  return { releases, loading };
}