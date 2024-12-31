import { supabase } from '../supabase';
import { Release } from '../../types/database';
import { ArtistData, ReleaseFormData } from '../../types/forms';
import { findOrCreateArtist } from '../artists/artistService';

export async function createOrUpdateRelease(
  data: ReleaseFormData & { created_by: string },
  artists: ArtistData[],
  existingReleaseId?: string
): Promise<string> {
  try {
    // Process artists first
    const artistIds = await Promise.all(
      artists
        .filter(artist => artist.name.trim())
        .map(async artist => {
          if (artist.id) return artist.id;
          return await findOrCreateArtist(artist.name);
        })
    );

    if (!artistIds.length) {
      throw new Error('At least one valid artist is required');
    }

    // Filter valid tracks
    const validTracks = data.tracks?.filter(track => 
      track.name.trim() && track.track_number > 0
    ) || [];

    // Prepare release data
    const releaseData = {
      name: data.name.trim(),
      release_type: data.release_type,
      cover_url: data.cover_url,
      genres: data.genres || [],
      record_label: data.record_label?.trim(),
      track_count: validTracks.length || data.track_count,
      spotify_url: data.spotify_url?.trim(),
      apple_music_url: data.apple_music_url?.trim(),
      release_date: data.release_date,
      description: data.description?.trim() || null,
      description_author_id: data.description?.trim() ? data.created_by : null,
      created_by: data.created_by
    };

    let releaseId = existingReleaseId;

    if (existingReleaseId) {
      // Update existing release
      const { error: releaseError } = await supabase
        .from('releases')
        .update({
          ...releaseData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReleaseId);

      if (releaseError) throw releaseError;

      // Update artist relationships
      await supabase
        .from('release_artists')
        .delete()
        .eq('release_id', existingReleaseId);

      // Delete existing tracks
      await supabase
        .from('tracks')
        .delete()
        .eq('release_id', existingReleaseId);
    } else {
      // Create new release
      const { data: newRelease, error: releaseError } = await supabase
        .from('releases')
        .insert(releaseData)
        .select('id')
        .single();

      if (releaseError) throw releaseError;
      if (!newRelease) throw new Error('Failed to create release');

      releaseId = newRelease.id;
    }

    // Create artist relationships
    await Promise.all(
      artistIds.map((artistId, index) => 
        supabase
          .from('release_artists')
          .insert({
            release_id: releaseId,
            artist_id: artistId,
            position: index
          })
      )
    );

    // Create tracks
    if (validTracks.length > 0) {
      const { error: tracksError } = await supabase
        .from('tracks')
        .insert(
          validTracks.map(track => ({
            release_id: releaseId,
            name: track.name,
            track_number: track.track_number,
            duration_ms: track.duration_ms || 0,
            preview_url: track.preview_url
          }))
        );

      if (tracksError) throw tracksError;

      // Create track credits
      const tracksWithCredits = validTracks.filter(track => track.credits?.length);
      if (tracksWithCredits.length > 0) {
        const { data: insertedTracks } = await supabase
          .from('tracks')
          .select('id, track_number')
          .eq('release_id', releaseId);

        if (insertedTracks) {
          const credits = tracksWithCredits.flatMap(track => {
            const insertedTrack = insertedTracks.find(t => t.track_number === track.track_number);
            return track.credits?.map(credit => ({
              track_id: insertedTrack!.id,
              name: credit.name,
              role: credit.role
            })) || [];
          });

          if (credits.length > 0) {
            await supabase
              .from('track_credits')
              .insert(credits);
          }
        }
      }
    }

    return releaseId;
  } catch (error) {
    console.error('Error in createOrUpdateRelease:', error);
    throw error;
  }
}