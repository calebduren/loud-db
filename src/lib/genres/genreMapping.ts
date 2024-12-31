import { supabase } from '../supabase';

export interface GenreGroup {
  id: string;
  name: string;
}

export interface GenreMapping {
  id: string;
  genre: string;
  group_id: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(fetchFn, retries - 1);
    }
    throw error;
  }
}

export async function getGenreGroups(): Promise<GenreGroup[]> {
  return fetchWithRetry(async () => {
    const { data, error } = await supabase
      .from('genre_groups')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching genre groups:', error);
      throw error;
    }

    return data || [];
  });
}

export async function getGenreMappings(): Promise<GenreMapping[]> {
  return fetchWithRetry(async () => {
    const { data, error } = await supabase
      .from('genre_mappings')
      .select('id, genre, group_id');

    if (error) {
      console.error('Error fetching genre mappings:', error);
      throw error;
    }

    return data || [];
  });
}

export async function createGenreGroup(name: string): Promise<GenreGroup> {
  // First check if group already exists
  const { data: existing } = await supabase
    .from('genre_groups')
    .select('*')
    .ilike('name', name)
    .maybeSingle();

  if (existing) {
    throw new Error('A group with this name already exists');
  }

  // Create new group
  const { data, error } = await supabase
    .from('genre_groups')
    .insert({ name: name.trim() })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A group with this name already exists');
    }
    throw error;
  }

  return data;
}

export async function createGenreMapping(genre: string, groupId: string): Promise<GenreMapping> {
  // Check if mapping already exists
  const { data: existing } = await supabase
    .from('genre_mappings')
    .select('*')
    .eq('genre', genre)
    .eq('group_id', groupId)
    .maybeSingle();

  if (existing) {
    throw new Error('This genre is already mapped to this group');
  }

  const { data, error } = await supabase
    .from('genre_mappings')
    .insert({ genre, group_id: groupId })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('This genre is already mapped to this group');
    }
    throw error;
  }

  return data;
}

export async function updateGenreGroup(id: string, name: string): Promise<GenreGroup> {
  // Check if group already exists with this name
  const { data: existing } = await supabase
    .from('genre_groups')
    .select('id')
    .neq('id', id)
    .ilike('name', name)
    .maybeSingle();

  if (existing) {
    throw new Error('A group with this name already exists');
  }

  const { data, error } = await supabase
    .from('genre_groups')
    .update({ name: name.trim() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGenreMapping(id: string): Promise<void> {
  const { error } = await supabase
    .from('genre_mappings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}