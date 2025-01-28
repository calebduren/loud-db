interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheEntry<any>>;
  private pendingRequests: Map<string, Promise<any>>;
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: { ttl?: number; force?: boolean } = {}
  ): Promise<T> {
    const { ttl = this.TTL, force = false } = options;
    
    // If force is true, delete the existing cache entry
    if (force) {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    }

    // Check if there's a pending request for this key
    const pendingRequest = this.pendingRequests.get(key);
    if (pendingRequest && !force) {
      return pendingRequest;
    }

    // Check cache if not forcing refresh
    if (!force) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
      }
    }

    // Create new request
    const request = fetchFn().then(data => {
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      this.pendingRequests.delete(key);
      return data;
    }).catch(error => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, request);
    return request;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

export const cache = Cache.getInstance();
