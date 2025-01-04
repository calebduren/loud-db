export const ErrorMessages = {
  DUPLICATE_RELEASE: 'This release already exists in the database',
  DUPLICATE_CHECK_FAILED: 'Unable to verify if this release already exists',
  IMPORT_FAILED: 'Failed to import release from Spotify',
  FETCH_ARTISTS_FAILED: 'Failed to fetch artist information',
  INVALID_URL: 'Please enter a valid Spotify URL',
  ARTIST_CREATION_FAILED: 'Failed to create artist',
  ARTIST_RELATIONSHIP_FAILED: 'Failed to create artist relationships',
  RELEASE_CREATION_FAILED: 'Failed to create release',
  NOT_FOUND: 'Resource not found',
  SPOTIFY_API_ERROR: 'Failed to communicate with Spotify API',
} as const;

export type ErrorType = keyof typeof ErrorMessages;

export class AppError extends Error {
  constructor(
    public type: ErrorType | string,
    public originalError?: Error
  ) {
    super(typeof type === 'string' ? type : ErrorMessages[type as ErrorType]);
    this.name = 'AppError';
  }
}