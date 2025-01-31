import { supabase } from '../supabase';
import { ReleaseType } from '../../types/database';
import { findOrCreateArtist } from '../artists/artistService';
import { AppError } from '../errors/messages';
import { normalizeGenre } from '../utils/genreUtils';

interface Track {
  name: string;
  duration_ms: number | null;
  track_number: number;
  preview_url: string | null;
}

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
  tracks?: Track[];
}

export async function createRelease(data: CreateReleaseData): Promise<string> {
  // Input validation
  if (!data.name?.trim()) {
    throw new AppError('Release name is required');
  }
  if (!data.artists?.length) {
    throw new AppError('At least one artist is required');
  }
  if (!data.created_by) {
    throw new AppError('User ID is required');
  }

  // Validate release date
  const releaseDate = new Date(data.release_date);
  if (isNaN(releaseDate.getTime())) {
    throw new AppError('Invalid release date');
  }

  // Ensure the date is in UTC and set to noon to avoid timezone issues
  const utcDate = new Date(Date.UTC(
    releaseDate.getFullYear(),
    releaseDate.getMonth(),
    releaseDate.getDate(),
    12, // Set to noon UTC
    0,
    0,
    0
  ));

  try {
    // Process artists first to ensure they exist
    const artistIds = await Promise.all(
      data.artists.map(artist => findOrCreateArtist(artist.name))
    );

    // Start a transaction
    const { data: release, error: releaseError } = await supabase
      .from('releases')
      .insert({
        name: data.name.trim(),
        release_type: data.release_type,
        cover_url: data.cover_url,
        genres: data.genres.map(normalizeGenre),
        record_label: data.record_label?.trim(),
        track_count: data.track_count,
        spotify_url: data.spotify_url,
        apple_music_url: data.apple_music_url,
        release_date: utcDate.toISOString(),
        created_by: data.created_by
      })
      .select()
      .single();

    if (releaseError || !release) {
      throw releaseError || new AppError('Failed to create release');
    }

    // Create artist relationships
    const { error: artistError } = await supabase
      .from('release_artists')
      .insert(
        artistIds.map((artistId, index) => ({
          release_id: release.id,
          artist_id: artistId,
          position: index + 1
        }))
      );

    if (artistError) {
      throw artistError;
    }

    // Create tracks if provided
    if (data.tracks?.length) {
      const { error: tracksError } = await supabase
        .from('tracks')
        .insert(
          data.tracks.map(track => ({
            release_id: release.id,
            name: track.name,
            duration_ms: track.duration_ms,
            track_number: track.track_number,
            preview_url: track.preview_url
          }))
        );

      if (tracksError) {
        throw tracksError;
      }
    }

    return release.id;
  } catch (error) {
    console.error('Error creating release:', error);
    throw error instanceof AppError ? error : new AppError('RELEASE_CREATION_FAILED');
  }
}