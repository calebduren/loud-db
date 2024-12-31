import { supabase } from '../supabase';

interface GenreGroup {
  id: string;
  name: string;
  genres?: string[];
}

let groupsCache: Record<string, GenreGroup> = {};

export async function fetchGenreGroups(): Promise<Record<string, GenreGroup>> {
  const { data: groups, error: groupsError } = await supabase
    .from('genre_groups')
    .select('id, name');

  if (groupsError) throw groupsError;

  const { data: mappings, error: mappingsError } = await supabase
    .from('genre_mappings')
    .select('genre, group_id');

  if (mappingsError) throw mappingsError;

  const groupMap: Record<string, GenreGroup> = {};
  
  // Initialize groups
  groups.forEach(group => {
    groupMap[group.id] = {
      id: group.id,
      name: group.name,
      genres: [] as string[]
    };
  });

  // Add genres to their groups
  mappings.forEach(mapping => {
    if (groupMap[mapping.group_id]) {
      groupMap[mapping.group_id].genres?.push(mapping.genre);
    }
  });

  groupsCache = groupMap;
  return groupMap;
}

export function getGenreGroups(): Record<string, GenreGroup> {
  return groupsCache;
}

export async function initializeGenreGroups(): Promise<void> {
  try {
    const groups = await fetchGenreGroups();
    groupsCache = groups;
  } catch (error) {
    console.error('Failed to initialize genre groups:', error);
    groupsCache = {};
    throw error;
  }
}