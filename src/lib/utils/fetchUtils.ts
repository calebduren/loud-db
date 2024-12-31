import { isNetworkError } from './errorHandling';

interface RetryConfig {
  maxAttempts?: number;
  delayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  delayMs: 1000,
  shouldRetry: isNetworkError
};

export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxAttempts, delayMs, shouldRetry } = {
    ...DEFAULT_CONFIG,
    ...config
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxAttempts - 1 && shouldRetry(error)) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
        continue;
      }
      break;
    }
  }

  throw lastError;
}