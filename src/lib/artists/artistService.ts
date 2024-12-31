import { supabase } from '../supabase';
import { Artist } from '../../types/database';

export async function findOrCreateArtist(name: string): Promise<string> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Artist name is required');
  }

  try {
    // First try to find existing artist
    const { data: existing, error: findError } = await supabase
      .from('artists')
      .select('id')
      .ilike('name', trimmedName)
      .maybeSingle();

    if (findError) throw findError;
    if (existing) return existing.id;

    // Create new artist if not found
    const { data: created, error: createError } = await supabase
      .from('artists')
      .insert({ name: trimmedName })
      .select('id')
      .single();

    if (createError) throw createError;
    if (!created) throw new Error('Failed to create artist');

    return created.id;
  } catch (error) {
    console.error('Error in findOrCreateArtist:', error);
    throw error;
  }
}

export async function createArtistRelationships(
  releaseId: string,
  artistIds: string[]
): Promise<void> {
  if (!releaseId || artistIds.length === 0) {
    throw new Error('Release ID and at least one artist ID are required');
  }

  try {
    const { error } = await supabase
      .from('release_artists')
      .insert(
        artistIds.map((artistId, index) => ({
          release_id: releaseId,
          artist_id: artistId,
          position: index
        }))
      );

    if (error) throw error;
  } catch (error) {
    console.error('Error in createArtistRelationships:', error);
    throw error;
  }
}

export async function clearArtistRelationships(releaseId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('release_artists')
      .delete()
      .eq('release_id', releaseId);

    if (error) throw error;
  } catch (error) {
    console.error('Error in clearArtistRelationships:', error);
    throw error;
  }
}