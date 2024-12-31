import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

export function useProfile(identifier?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!identifier) {
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        let query = supabase.from('profiles').select('*');

        // Check if identifier is a UUID (user ID) or username
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        
        if (isUUID) {
          query = query.eq('id', identifier);
        } else {
          query = query.eq('username', identifier);
        }

        const { data, error: queryError } = await query.maybeSingle();

        if (queryError) throw queryError;
        if (!data) throw new Error('Profile not found');

        setProfile(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [identifier]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!identifier) throw new Error('No user ID provided');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', identifier);

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