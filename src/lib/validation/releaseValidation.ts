import { supabase } from '../supabase';
import { normalizeString, areSimilarStrings } from '../utils/stringUtils';
import { ArtistData } from '../../types/forms';
import { ReleaseValidationError, RELEASE_ERRORS, createDuplicateError } from '../errors/releaseErrors';
import { Release } from '../../types/database';

interface ValidationResult {
  isValid: boolean;
  error?: ReleaseValidationError;
}

export async function validateNewRelease(
  name: string,
  artists: ArtistData[],
  releaseDate: string,
  existingReleaseId?: string
): Promise<ValidationResult> {
  try {
    // Validate name
    const normalizedName = normalizeString(name);
    if (!normalizedName) {
      return { 
        isValid: false, 
        error: {
          ...RELEASE_ERRORS.INVALID_NAME,
          details: [
            'Release name is required',
            'Name cannot be empty or only special characters'
          ]
        }
      };
    }

    // Validate artists
    if (!artists.length) {
      return { 
        isValid: false, 
        error: {
          ...RELEASE_ERRORS.INVALID_ARTISTS,
          details: ['At least one artist is required']
        }
      };
    }

    const normalizedArtistNames = artists.map(a => normalizeString(a.name));
    const invalidArtists = normalizedArtistNames.filter(name => !name);
    if (invalidArtists.length > 0) {
      return { 
        isValid: false, 
        error: {
          ...RELEASE_ERRORS.INVALID_ARTISTS,
          details: [
            'All artist names must be valid',
            'Artist names cannot be empty or only special characters'
          ]
        }
      };
    }

    // Validate release date
    const releaseDateTime = new Date(releaseDate).getTime();
    if (isNaN(releaseDateTime)) {
      return {
        isValid: false,
        error: {
          ...RELEASE_ERRORS.INVALID_DATE,
          details: ['Please provide a valid release date']
        }
      };
    }

    // Check for duplicate releases
    let query = supabase
      .from('releases_view')
      .select(`
        id,
        name,
        release_date,
        artists
      `);
    
    if (existingReleaseId) {
      query = query.neq('id', existingReleaseId);
    }

    const { data: existingReleases } = await query;

    if (existingReleases) {
      for (const existing of existingReleases) {
        if (areSimilarStrings(existing.name, name)) {
          const existingArtists = existing.artists.map((a: any) => 
            normalizeString(a.artist.name)
          ).sort();

          const sameArtists = normalizedArtistNames.length === existingArtists.length &&
            normalizedArtistNames.sort().every((name, i) => name === existingArtists[i]);

          const existingDate = new Date(existing.release_date);
          const newDate = new Date(releaseDate);
          const sameDate = existingDate.toISOString().split('T')[0] === 
                          newDate.toISOString().split('T')[0];

          if (sameArtists && sameDate) {
            return {
              isValid: false,
              error: createDuplicateError(
                name,
                artists.map(a => a.name),
                releaseDate
              )
            };
          }
        }
      }
    }

    return { isValid: true };
  } catch (error) {
    console.error('Release validation error:', error);
    return {
      isValid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Failed to validate release',
        details: [
          'An error occurred while validating the release',
          'Please try again or contact support if the problem persists'
        ]
      }
    };
  }
}

export async function checkSpotifyDuplicate(
  name: string,
  artists: ArtistData[],
  spotifyUrl?: string
): Promise<{ isDuplicate: boolean; existingRelease?: Release }> {
  // First, check for exact Spotify URL match if provided
  if (spotifyUrl) {
    const { data: releaseByUrl } = await supabase
      .from('releases')
      .select('*, artists!releases_artists ( artist:artists( * ) )')
      .eq('spotify_url', spotifyUrl)
      .single();

    if (releaseByUrl) {
      return { isDuplicate: true, existingRelease: releaseByUrl };
    }
  }

  // If no match by URL, check for similar name and artists
  const normalizedName = normalizeString(name);
  const normalizedArtistNames = artists.map(a => normalizeString(a.name));

  const { data: releases } = await supabase
    .from('releases')
    .select('*, artists!releases_artists ( artist:artists( * ) )')
    .textSearch('name', normalizedName, { config: 'english' });

  if (!releases) return { isDuplicate: false };

  // Check each potential match
  for (const release of releases) {
    // Check if name is similar
    if (!areSimilarStrings(normalizedName, normalizeString(release.name))) {
      continue;
    }

    // Get artist names from the release
    const releaseArtists = release.artists.map(ra => normalizeString(ra.artist.name));

    // Check if the artists match (at least 50% of artists should match)
    const matchingArtists = normalizedArtistNames.filter(artistName =>
      releaseArtists.some(releaseArtist => areSimilarStrings(artistName, releaseArtist))
    );

    if (matchingArtists.length >= Math.min(normalizedArtistNames.length, releaseArtists.length) * 0.5) {
      return { isDuplicate: true, existingRelease: release };
    }
  }

  return { isDuplicate: false };
}