import { supabase } from '../supabase';
import { ReleaseType } from '../../types/database';
import { findOrCreateArtist } from '../artists/artistService';

interface CreateReleaseData {
  name: string;
  release_type: ReleaseType;
  cover_url?: string;
  genres: string[];
  record_label?: string;
  track_count: number;
  spotify_url?: string;
  apple_music_url?: string;
  release_date: string;
  created_by: string;
  artists: { id?: string; name: string; }[];
}

export async function createRelease(data: CreateReleaseData): Promise<string> {
  // Input validation
  if (!data.name?.trim()) {
    throw new Error('Release name is required');
  }
  if (!data.artists?.length) {
    throw new Error('At least one artist is required');
  }
  if (!data.created_by) {
    throw new Error('User ID is required');
  }

  // Validate release date
  const releaseDate = new Date(data.release_date);
  if (isNaN(releaseDate.getTime())) {
    throw new Error('Invalid release date');
  }

  try {
    // Process artists first to ensure they exist
    const artistIds = await Promise.all(
      data.artists
        .filter(artist => artist.name.trim())
        .map(async artist => {
          try {
            return artist.id || await findOrCreateArtist(artist.name);
          } catch (error) {
            console.error('Error processing artist:', artist.name, error);
            throw new Error(`Failed to process artist: ${artist.name}`);
          }
        })
    );

    if (artistIds.length === 0) {
      throw new Error('At least one valid artist is required');
    }

    // Create release
    const { data: release, error: releaseError } = await supabase
      .from('releases')
      .insert({
        name: data.name.trim(),
        release_type: data.release_type,
        cover_url: data.cover_url,
        genres: Array.isArray(data.genres) ? data.genres : [],
        record_label: data.record_label?.trim(),
        track_count: Math.max(1, data.track_count),
        spotify_url: data.spotify_url?.trim(),
        apple_music_url: data.apple_music_url?.trim(),
        release_date: releaseDate.toISOString(),
        created_by: data.created_by
      })
      .select('id')
      .single();

    if (releaseError) {
      console.error('Release creation error:', releaseError);
      throw new Error(releaseError.message);
    }

    if (!release?.id) {
      throw new Error('No release ID returned');
    }

    // Create artist relationships
    const { error: artistError } = await supabase
      .from('release_artists')
      .insert(
        artistIds.map((artistId, index) => ({
          release_id: release.id,
          artist_id: artistId,
          position: index
        }))
      );

    if (artistError) {
      // Rollback release creation
      await supabase
        .from('releases')
        .delete()
        .eq('id', release.id);
      throw new Error('Failed to create artist relationships');
    }

    return release.id;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create release';
    console.error('Create release error:', error);
    throw new Error(message);
  }
}