// Simple in-memory rate limiting
const rateLimits = new Map<string, { lastAttempt: number; count: number }>();

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxAttempts: number;  // Maximum attempts allowed in the window
}

export function checkRateLimit(key: string, config: RateLimitConfig): {
  allowed: boolean;
  remainingTime: number;
} {
  const now = Date.now();
  const limit = rateLimits.get(key);

  // If no previous attempts or window has expired
  if (!limit || (now - limit.lastAttempt) > config.windowMs) {
    rateLimits.set(key, { lastAttempt: now, count: 1 });
    return { allowed: true, remainingTime: 0 };
  }

  // If within window but under limit
  if (limit.count < config.maxAttempts) {
    rateLimits.set(key, { lastAttempt: now, count: limit.count + 1 });
    return { allowed: true, remainingTime: 0 };
  }

  // Rate limit exceeded
  const remainingTime = config.windowMs - (now - limit.lastAttempt);
  return { allowed: false, remainingTime };
}

export function formatRemainingTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  return seconds > 60 
    ? `${Math.ceil(seconds / 60)} minutes` 
    : `${seconds} seconds`;
}