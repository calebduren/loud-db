import { supabase } from '../supabase';
import { Release, ReleaseType } from '../../types/database';
import { ArtistData, ReleaseFormData } from '../../types/forms';
import { findOrCreateArtist } from '../artists/artistService';
import { processReleaseImage } from '../storage/imageUtils';
import { logger } from '../utils/logger';
import { 
  ReleaseServiceError, 
  ArtistValidationError, 
  DatabaseError,
  TrackValidationError 
} from '../errors/releaseServiceErrors';

export async function createOrUpdateRelease(
  data: ReleaseFormData & { created_by: string },
  artists: ArtistData[],
  existingRelease?: Release
): Promise<string> {
  logger.info(
    `${existingRelease ? 'Updating' : 'Creating'} release`,
    { releaseName: data.name, artistCount: artists.length }
  );

  const { data: existingTransaction } = await supabase
    .from('releases')
    .select('id')
    .eq('id', existingRelease?.id ?? '')
    .single();

  // Verify the release still exists if we're updating
  if (existingRelease && !existingTransaction) {
    logger.error('Release not found for update', undefined, { releaseId: existingRelease.id });
    throw new DatabaseError('Release no longer exists');
  }

  try {
    // Download and upload cover image if it's a URL
    const coverUrl = data.cover_url 
      ? await processReleaseImage(data.cover_url)
      : null;
    
    logger.debug('Processed cover image', { originalUrl: data.cover_url, newUrl: coverUrl });

    // Process artists first
    const validArtists = artists.filter(artist => artist.name.trim());
    if (!validArtists.length) {
      logger.warn('No valid artists provided', { artists });
      throw new ArtistValidationError('At least one valid artist is required');
    }

    const artistIds = await Promise.all(
      validArtists.map(async artist => {
        if (artist.id) return artist.id;
        return await findOrCreateArtist(artist.name);
      })
    );

    logger.debug('Processed artists', { artistIds });

    // Filter and validate tracks
    const validTracks = (data.tracks ?? []).filter(track => 
      track.name.trim() && track.track_number > 0
    );

    if (data.tracks?.length && !validTracks.length) {
      logger.warn('All provided tracks are invalid', { tracks: data.tracks });
      throw new TrackValidationError('All provided tracks are invalid');
    }

    // Prepare release data
    const releaseData = {
      name: data.name.trim(),
      release_type: data.release_type,
      cover_url: coverUrl,
      genres: data.genres ?? [],
      record_label: data.record_label?.trim() ?? null,
      track_count: validTracks.length || data.track_count || 0,
      spotify_url: data.spotify_url?.trim() ?? null,
      apple_music_url: data.apple_music_url?.trim() ?? null,
      release_date: data.release_date,
      description: data.description?.trim() ?? null,
      description_author_id: data.description?.trim() ? data.created_by : null,
      created_by: data.created_by,
      updated_at: new Date().toISOString()
    };

    let releaseId = existingRelease?.id;

    logger.info('Executing database transaction', { 
      releaseId,
      trackCount: validTracks.length,
      artistCount: artistIds.length 
    });

    // Use a transaction for atomicity
    const { error: txnError } = await supabase.rpc('update_release_transaction', {
      p_release_id: releaseId,
      p_release_data: releaseData,
      p_artist_ids: artistIds,
      p_tracks: validTracks.map(track => ({
        name: track.name.trim(),
        track_number: track.track_number,
        duration_ms: track.duration_ms ?? 0,
        preview_url: track.preview_url ?? null
      })),
      p_track_credits: validTracks
        .filter(track => track.credits?.length)
        .flatMap(track => 
          track.credits?.map(credit => ({
            track_number: track.track_number,
            name: credit.name.trim(),
            role: credit.role.trim()
          })) ?? []
        )
    });

    if (txnError) {
      logger.error('Transaction failed', txnError);
      throw new DatabaseError('Failed to update release', txnError);
    }

    // If this was a new release, get the ID
    if (!releaseId) {
      const { data: newRelease, error: fetchError } = await supabase
        .from('releases')
        .select('id')
        .eq('name', releaseData.name)
        .eq('created_by', releaseData.created_by)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !newRelease) {
        logger.error('Failed to fetch new release ID', fetchError);
        throw new DatabaseError('Failed to fetch new release ID');
      }

      releaseId = newRelease.id;
    }

    logger.info('Successfully processed release', { 
      releaseId,
      name: releaseData.name,
      trackCount: validTracks.length,
      artistCount: artistIds.length
    });

    return releaseId;
  } catch (error) {
    if (error instanceof ReleaseServiceError) {
      throw error;
    }
    
    logger.error('Unexpected error in createOrUpdateRelease', 
      error instanceof Error ? error : undefined,
      { releaseName: data.name }
    );

    throw new DatabaseError(
      'An unexpected error occurred while saving the release',
      error instanceof Error ? error : undefined
    );
  }
}
