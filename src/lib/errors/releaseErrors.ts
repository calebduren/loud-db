export interface ReleaseValidationError {
  code: string;
  message: string;
  details?: string[];
}

export const RELEASE_ERRORS = {
  DUPLICATE: {
    code: 'DUPLICATE_RELEASE',
    message: 'This release already exists',
  },
  INVALID_NAME: {
    code: 'INVALID_NAME',
    message: 'Invalid release name',
  },
  INVALID_ARTISTS: {
    code: 'INVALID_ARTISTS',
    message: 'Invalid artist information',
  },
  INVALID_DATE: {
    code: 'INVALID_DATE',
    message: 'Invalid release date',
  }
} as const;

export function createDuplicateError(name: string, artists: string[], date: string): ReleaseValidationError {
  return {
    ...RELEASE_ERRORS.DUPLICATE,
    details: [
      `A release with the name "${name}" already exists`,
      `By: ${artists.join(', ')}`,
      `Released on: ${new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`,
      'Please check if this release has already been added'
    ]
  };
}