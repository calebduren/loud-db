interface RateLimit {
  count: number;
  resetTime: number;
}

const limits = new Map<string, RateLimit>();
const WINDOW_SIZE = 30000; // 30 seconds
const MAX_REQUESTS = 10; // Max requests per window

export async function checkRateLimit(endpoint: string): Promise<void> {
  const limit = limits.get(endpoint) || { count: 0, resetTime: Date.now() + WINDOW_SIZE };
  
  // Reset counter if window has passed
  if (Date.now() > limit.resetTime) {
    limit.count = 0;
    limit.resetTime = Date.now() + WINDOW_SIZE;
  }
  
  if (limit.count >= MAX_REQUESTS) {
    const waitTime = limit.resetTime - Date.now();
    await new Promise(resolve => setTimeout(resolve, waitTime));
    limit.count = 0;
    limit.resetTime = Date.now() + WINDOW_SIZE;
  }
  
  limit.count++;
  limits.set(endpoint, limit);
}