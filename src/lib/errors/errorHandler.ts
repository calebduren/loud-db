import { PostgrestError } from '@supabase/supabase-js';

export class ReleaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ReleaseError';
  }
}

export function handleDatabaseError(error: unknown): never {
  if (error instanceof PostgrestError) {
    // Handle specific Postgres errors
    switch (error.code) {
      case '23505': // unique violation
        throw new ReleaseError('A release with this name already exists', error.code, error);
      case '23503': // foreign key violation
        throw new ReleaseError('Invalid artist reference', error.code, error);
      default:
        throw new ReleaseError(
          'Database error occurred',
          error.code,
          error
        );
    }
  }
  
  // Handle other types of errors
  throw new ReleaseError(
    error instanceof Error ? error.message : 'An unexpected error occurred',
    undefined,
    error
  );
}