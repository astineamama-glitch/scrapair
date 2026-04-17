import redisClient from '../config/redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRatio: number;
}

let cacheHits = 0;
let cacheMisses = 0;
let lastResetTime = Date.now();
const STATS_RESET_INTERVAL = 3600000; // Reset hourly to prevent unbounded growth
let isResettingStats = false;

export class CacheService {
  /**
   * Generate a versioned cache key
   * @param prefix - Cache key prefix (e.g., 'materials', 'users', 'collections')
   * @param id - Optional ID for specific items
   * @param version - Cache version for busting (default: 'v1')
   */
  static generateCacheKey(prefix: string, id?: string | number, version: string = 'v1'): string {
    if (id) {
      return `${prefix}:${version}:${id}`;
    }
    return `${prefix}:${version}:all`;
  }

  /**
   * Set data in cache with TTL
   */
  static async setCached<T>(
    key: string,
    data: T,
    ttl: number = 3600 // Default 1 hour
  ): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      await redisClient.setex(key, ttl, serialized);
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
      // Fail silently - continue without cache
    }
  }

  /**
   * Get data from cache
   */
  static async getCached<T>(key: string): Promise<T | null> {
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        cacheHits++;
        return JSON.parse(cached) as T;
      }
      cacheMisses++;
      return null;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      cacheMisses++;
      return null;
    }
  }

  /**
   * Delete specific cache key
   */
  static async deleteCached(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error(`Cache DEL error for key ${key}:`, error);
    }
  }

  /**
   * Invalidate cache by pattern (e.g., 'materials:v1*')
   */
  static async invalidateCachePattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      console.error(`Cache pattern invalidation error for ${pattern}:`, error);
    }
  }

  /**
   * Invalidate all cache for a specific prefix
   */
  static async invalidateCachePrefix(prefix: string): Promise<void> {
    const pattern = `${prefix}:*`;
    await this.invalidateCachePattern(pattern);
  }

  /**
   * Get cache statistics with auto-reset to prevent memory leaks
   */
  static getCacheStats(): CacheStats {
    // Auto-reset stats every hour to prevent unbounded growth
    const now = Date.now();
    if (now - lastResetTime > STATS_RESET_INTERVAL && !isResettingStats) {
      isResettingStats = true;
      try {
        lastResetTime = now;
        cacheHits = 0;
        cacheMisses = 0;
      } finally {
        isResettingStats = false;
      }
    }

    const total = cacheHits + cacheMisses;
    const hitRatio = total === 0 ? 0 : (cacheHits / total) * 100;
    return {
      hits: cacheHits,
      misses: cacheMisses,
      hitRatio: Math.round(hitRatio * 100) / 100
    };
  }

  /**
   * Reset cache statistics
   */
  static resetCacheStats(): void {
    cacheHits = 0;
    cacheMisses = 0;
  }

  /**
   * Check if key exists in cache
   */
  static async cacheExists(key: string): Promise<boolean> {
    try {
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set pattern - fetch from cache, or call callback and cache result
   */
  static async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await this.getCached<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Not cached, execute callback
      const result = await callback();

      // Cache the result
      await this.setCached(key, result, ttl);

      return result;
    } catch (error) {
      console.error(`Cache getOrSet error for key ${key}:`, error);
      // If cache fails, still execute callback
      return await callback();
    }
  }

  /**
   * Clear entire cache (use with caution!)
   */
  static async clearAllCache(): Promise<void> {
    try {
      await redisClient.flushdb();
      console.warn('⚠️  All cache cleared');
    } catch (error) {
      console.error('Cache clearAll error:', error);
    }
  }
}

export default CacheService;
