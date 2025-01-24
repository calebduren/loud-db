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

    // Start with the release upsert and get the ID back
    const { data: upsertReleaseData, error: txnError } = await supabase.from('releases')
      .upsert({
        id: releaseId,
        name: releaseData.name,
        release_type: releaseData.release_type,
        cover_url: releaseData.cover_url,
        genres: releaseData.genres,
        record_label: releaseData.record_label,
        track_count: releaseData.track_count,
        spotify_url: releaseData.spotify_url,
        apple_music_url: releaseData.apple_music_url,
        release_date: releaseData.release_date,
        description: releaseData.description,
        description_author_id: releaseData.description_author_id,
        created_by: releaseData.created_by,
        updated_at: releaseData.updated_at
      }, {
        onConflict: 'id',
        returning: 'minimal'
      })
      .select('id')
      .single();

    if (txnError) {
      logger.error('Failed to upsert release', txnError);
      throw new DatabaseError('Failed to update release', txnError);
    }

    // Get the release ID (either new or existing)
    const finalReleaseId = upsertReleaseData.id;

    // Delete existing relationships and tracks if updating
    if (releaseId) {
      const { error: deleteArtistsError } = await supabase
        .from('release_artists')
        .delete()
        .eq('release_id', finalReleaseId);

      if (deleteArtistsError) {
        logger.error('Failed to delete existing artists', deleteArtistsError);
        throw new DatabaseError('Failed to update release', deleteArtistsError);
      }

      const { error: deleteTracksError } = await supabase
        .from('tracks')
        .delete()
        .eq('release_id', finalReleaseId);

      if (deleteTracksError) {
        logger.error('Failed to delete existing tracks', deleteTracksError);
        throw new DatabaseError('Failed to update release', deleteTracksError);
      }
    }

    // Insert artist relationships
    const { error: artistError } = await supabase
      .from('release_artists')
      .insert(
        artistIds.map((artistId, index) => ({
          release_id: finalReleaseId,
          artist_id: artistId,
          position: index
        }))
      );

    if (artistError) {
      logger.error('Failed to insert artists', artistError);
      throw new DatabaseError('Failed to update release', artistError);
    }

    // Insert tracks and their credits
    for (const track of validTracks) {
      const { data: trackData, error: trackError } = await supabase
        .from('tracks')
        .insert({
          release_id: finalReleaseId,
          name: track.name.trim(),
          track_number: track.track_number,
          duration_ms: track.duration_ms ?? 0,
          preview_url: track.preview_url ?? null
        })
        .select()
        .single();

      if (trackError) {
        logger.error('Failed to insert track', trackError);
        throw new DatabaseError('Failed to update release', trackError);
      }

      if (track.credits?.length) {
        const { error: creditError } = await supabase
          .from('track_credits')
          .insert(
            track.credits.map(credit => ({
              track_id: trackData.id,
              name: credit.name.trim(),
              role: credit.role.trim()
            }))
          );

        if (creditError) {
          logger.error('Failed to insert track credits', creditError);
          throw new DatabaseError('Failed to update release', creditError);
        }
      }
    }

    logger.info('Successfully processed release', { 
      releaseId: finalReleaseId,
      name: releaseData.name,
      trackCount: validTracks.length,
      artistCount: artistIds.length
    });

    return finalReleaseId;
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
