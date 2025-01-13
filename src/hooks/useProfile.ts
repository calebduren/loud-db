import { useEffect, useState } from 'react';
import { Profile } from '../types/database';
import { supabase } from '../lib/supabase';
import { cache } from '../lib/cache';

// Batch profile requests that occur within this window
const BATCH_WINDOW = 50; // ms
let batchTimeout: NodeJS.Timeout | null = null;
let pendingIds: Set<string> = new Set();

async function fetchProfiles(userIds: string[]): Promise<Record<string, Profile>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  if (error) throw error;

  const profileMap: Record<string, Profile> = {};
  data?.forEach(profile => {
    profileMap[profile.id] = profile;
  });
  return profileMap;
}

export function useProfile(identifier?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!identifier) {
      setLoading(false);
      return;
    }

    const startTime = performance.now();
    let mounted = true;

    const loadProfile = async () => {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        const userId = isUUID ? identifier : await cache.get(`username:${identifier}`, async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', identifier)
            .maybeSingle();

          if (error) throw error;
          if (!data) throw new Error('Profile not found');

          return data.id;
        });

        const profileData = await cache.get(
          `profile:${userId}`,
          async () => {
            // Add to batch
            pendingIds.add(userId);

            // Create or reset batch timeout
            if (batchTimeout) {
              clearTimeout(batchTimeout);
            }

            const profilePromise = new Promise<Profile>((resolve, reject) => {
              batchTimeout = setTimeout(async () => {
                try {
                  const ids = Array.from(pendingIds);
                  pendingIds.clear();
                  const profiles = await fetchProfiles(ids);
                  ids.forEach(id => {
                    cache.get(`profile:${id}`, async () => profiles[id]);
                  });
                  resolve(profiles[userId]);
                } catch (error) {
                  reject(error);
                }
              }, BATCH_WINDOW);
            });

            return profilePromise;
          },
          { ttl: 5 * 60 * 1000 } // 5 minutes TTL
        );

        if (mounted) {
          setProfile(profileData);
          setError(null);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          const endTime = performance.now();
          if (process.env.NODE_ENV === 'development') {
            console.log(`Profile load took ${Math.round(endTime - startTime)}ms`);
          }
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [identifier]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!identifier) throw new Error('No user ID provided');

    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      const userId = isUUID ? identifier : await cache.get(`username:${identifier}`, async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', identifier)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('Profile not found');

        return data.id;
      });

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  return { profile, loading, error, updateProfile };
}