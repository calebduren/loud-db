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
      console.log('Fetching preferences for user:', user?.id);
      
      const { data: prefs, error } = await supabase
        .from('user_genre_preferences')
        .select(`
          weight,
          genre_group:genre_groups(name)
        `)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      console.log('Raw preferences from DB:', {
        count: prefs?.length || 0,
        preferences: prefs
      });

      if (prefs) {
        const prefMap = prefs.reduce((acc, pref) => {
          if (pref.genre_group?.name) {
            acc[pref.genre_group.name] = pref.weight;
          }
          return acc;
        }, {} as Record<string, number>);

        console.log('Processed preferences:', {
          count: Object.keys(prefMap).length,
          preferences: prefMap
        });

        setPreferences(prefMap);
      } else {
        console.log('No preferences found, using empty map');
        setPreferences({});
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      showToast({
        type: 'error',
        message: 'Failed to load genre preferences'
      });
      // Set empty preferences to allow the app to function
      setPreferences({});
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
        message: 'Genre preference updated.'
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