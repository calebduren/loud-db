export const ErrorMessages = {
  DUPLICATE_RELEASE: 'This release already exists in the database',
  DUPLICATE_CHECK_FAILED: 'Unable to verify if this release already exists',
  IMPORT_FAILED: 'Failed to import release from Spotify',
  FETCH_ARTISTS_FAILED: 'Failed to fetch artist information',
  INVALID_URL: 'Please enter a valid Spotify album URL',
  ARTIST_CREATION_FAILED: 'Failed to create artist',
  ARTIST_RELATIONSHIP_FAILED: 'Failed to create artist relationships',
  RELEASE_CREATION_FAILED: 'Failed to create release',
} as const;

export type ErrorType = keyof typeof ErrorMessages;

export class AppError extends Error {
  constructor(
    public type: ErrorType,
    public originalError?: Error
  ) {
    super(ErrorMessages[type]);
    this.name = 'AppError';
  }
}