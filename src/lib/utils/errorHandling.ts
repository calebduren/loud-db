import { PostgrestError } from '@supabase/postgrest-js';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, defaultMessage: string): never {
  console.error('Error:', error);

  if (error instanceof PostgrestError) {
    throw new AppError(
      error.message,
      error.code,
      error.details
    );
  }

  if (error instanceof Error) {
    throw new AppError(error.message);
  }

  throw new AppError(defaultMessage);
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network request failed') ||
    error.message.includes('connection timeout')
  );
}