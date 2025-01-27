import { supabase } from '../supabase';
import { GenrePreference } from '../../types/database';

export async function getGenreGroupId(groupName: string): Promise<string> {
  const { data, error } = await supabase
    .from('genre_groups')
    .select('id')
    .eq('name', groupName)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Genre group not found');
  
  return data.id;
}

export async function upsertUserPreference(
  userId: string,
  groupId: string,
  weight: number
): Promise<void> {
  const { error } = await supabase
    .from('user_genre_preferences')
    .upsert(
      {
        user_id: userId,
        genre_group_id: groupId,
        weight // Store exact decimal value now that we use float
      },
      {
        onConflict: 'user_id,genre_group_id',
        ignoreDuplicates: false
      }
    );

  if (error) throw error;
}