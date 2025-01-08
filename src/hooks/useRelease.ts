import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Release } from '../types/database';

export function useRelease(id: string) {
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchRelease();
  }, [id]); // Add fetchRelease to dependencies

  const fetchRelease = async () => {
    try {
      // Fetch release with all relationships
      const { data, error } = await supabase
        .from('releases_view')
        .select(`
          id,
          name,
          release_type,
          cover_url,
          genres,
          record_label,
          track_count,
          spotify_url,
          apple_music_url,
          created_at,
          updated_at,
          created_by,
          release_date,
          artists,
          tracks
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Release not found');
      
      // Add missing fields to tracks
      const tracksWithMissingFields = data.tracks?.map(track => ({
        ...track,
        release_id: data.id,
        created_at: track.created_at || data.created_at // Use track's created_at if available, fallback to release's
      })) || [];

      setRelease({
        ...data,
        tracks: tracksWithMissingFields
      });
      setError(null);
    } catch (err) {
      console.error('[useRelease] Error fetching release:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch release');
      setRelease(null);
    } finally {
      setLoading(false);
    }
  };

  return { release, loading, error };
}