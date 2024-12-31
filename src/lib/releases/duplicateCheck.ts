import { supabase } from '../supabase';
import { SpotifyReleaseData } from '../spotify/types';
import { checkDuplicateRelease } from './validation';
import { AppError } from '../errors/messages';

export async function checkDuplicateSpotifyRelease(release: SpotifyReleaseData): Promise<boolean> {
  try {
    const { data: existingArtists, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .in('name', release.artists.map(a => a.name));

    if (artistError) {
      throw new AppError('FETCH_ARTISTS_FAILED', artistError);
    }

    const artistIds = existingArtists?.map(a => a.id) || [];
    return await checkDuplicateRelease(release.name, artistIds);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('DUPLICATE_CHECK_FAILED', error instanceof Error ? error : undefined);
  }
}