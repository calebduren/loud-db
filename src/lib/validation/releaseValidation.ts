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

export async function checkSpotifyDuplicate(spotifyUrl: string): Promise<boolean> {
  if (!spotifyUrl) return false;

  // Normalize the Spotify URL by removing query parameters and trailing slashes
  const normalizedUrl = spotifyUrl.split('?')[0].replace(/\/$/, '');

  // Check if a release with this Spotify URL already exists
  const { data: releases } = await supabase
    .from('releases')
    .select('spotify_url')
    .or(`spotify_url.eq.${normalizedUrl},spotify_url.eq.${spotifyUrl}`);

  // Also check if any existing URLs match after normalization
  if (releases && releases.length > 0) {
    const normalizedExistingUrls = releases.map(r => 
      r.spotify_url?.split('?')[0].replace(/\/$/, '')
    );
    return normalizedExistingUrls.includes(normalizedUrl);
  }

  return false;
}