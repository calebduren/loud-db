export class ReleaseServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ReleaseServiceError';
  }
}

export class ArtistValidationError extends ReleaseServiceError {
  constructor(message: string) {
    super(message, 'ARTIST_VALIDATION_ERROR');
  }
}

export class ImageUploadError extends ReleaseServiceError {
  constructor(message: string) {
    super(message, 'IMAGE_UPLOAD_ERROR');
  }
}

export class DatabaseError extends ReleaseServiceError {
  constructor(message: string, public originalError?: Error) {
    super(message, 'DATABASE_ERROR');
  }
}

export class TrackValidationError extends ReleaseServiceError {
  constructor(message: string) {
    super(message, 'TRACK_VALIDATION_ERROR');
  }
}
