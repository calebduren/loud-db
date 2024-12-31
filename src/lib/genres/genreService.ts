import { supabase } from '../supabase';
import { fetchWithRetry } from '../utils/fetchUtils';

const RETRY_CONFIG = {
  maxAttempts: 3,
  delayMs: 1000,
  shouldRetry: (error: unknown) => {
    // Retry on network errors or rate limits
    if (error instanceof Error) {
      return error.message.includes('Failed to fetch') || 
             error.message.includes('rate limit');
    }
    return false;
  }
};

export async function fetchGenreGroups() {
  try {
    // Fetch both groups and mappings in parallel
    const [groupsResponse, mappingsResponse] = await Promise.all([
      fetchWithRetry(() =>
        supabase
          .from('genre_groups')
          .select('id, name')
          .order('name'),
        RETRY_CONFIG
      ),
      fetchWithRetry(() =>
        supabase
          .from('genre_mappings')
          .select('genre, group_id'),
        RETRY_CONFIG
      )
    ]);

    if (groupsResponse.error) throw groupsResponse.error;
    if (mappingsResponse.error) throw mappingsResponse.error;

    const groups = groupsResponse.data || [];
    const mappings = mappingsResponse.data || [];

    // Create mapping of group names to genres
    const groupMap: Record<string, string[]> = {};
    groups.forEach(group => {
      groupMap[group.name] = mappings
        .filter(m => m.group_id === group.id)
        .map(m => m.genre)
        .sort();
    });

    return groupMap;
  } catch (error) {
    console.error('Error fetching genre data:', error);
    // Return empty mapping instead of throwing to prevent UI disruption
    return {};
  }
}