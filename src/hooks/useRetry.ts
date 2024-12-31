import { useState } from 'react';
import { isNetworkError } from '../lib/utils/errorHandling';

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

export function useRetry() {
  const [attempts, setAttempts] = useState(0);

  const executeWithRetry = async <T>(
    fn: () => Promise<T>,
    config: RetryConfig = {}
  ): Promise<T> => {
    const { maxAttempts, delayMs, shouldRetry } = {
      ...DEFAULT_CONFIG,
      ...config
    };

    try {
      return await fn();
    } catch (error) {
      if (attempts < maxAttempts && shouldRetry(error)) {
        setAttempts(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return executeWithRetry(fn, config);
      }
      throw error;
    } finally {
      setAttempts(0);
    }
  };

  return {
    executeWithRetry,
    attempts,
    isRetrying: attempts > 0
  };
}