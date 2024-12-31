import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import { useToast } from '../useToast';
import { useGenreGroups } from '../useGenreGroups';
import { getGenreGroupId, upsertUserPreference } from '../../lib/preferences/genrePreferences';

export function useGenrePreferences() {
  const { user } = useAuth();
  const { genreGroups, loading: groupsLoading } = useGenreGroups();
  const [preferences, setPreferences] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (!user || groupsLoading) return;
    fetchPreferences();
  }, [user, groupsLoading]);

  const fetchPreferences = async () => {
    try {
      const { data: prefs } = await supabase
        .from('user_genre_preferences')
        .select(`
          weight,
          genre_group:genre_groups(name)
        `)
        .eq('user_id', user?.id);

      if (prefs) {
        const prefMap = prefs.reduce((acc, pref) => {
          if (pref.genre_group?.name) {
            acc[pref.genre_group.name] = pref.weight;
          }
          return acc;
        }, {} as Record<string, number>);
        setPreferences(prefMap);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (groupName: string, weight: number) => {
    if (!user) return;

    // Ensure weight is within valid range
    const validWeight = Math.max(0, Math.min(5, weight));

    try {
      const groupId = await getGenreGroupId(groupName);
      await upsertUserPreference(user.id, groupId, validWeight);

      setPreferences(prev => ({
        ...prev,
        [groupName]: validWeight
      }));

      showToast({
        type: 'success',
        message: 'Preference updated'
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      showToast({
        type: 'error',
        message: 'Failed to update preference'
      });
    }
  };

  return {
    genreGroups,
    preferences,
    updatePreference,
    loading: loading || groupsLoading
  };
}