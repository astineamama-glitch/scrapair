import { Request, Response, NextFunction } from 'express';
import CacheService from '../services/cacheService';

/**
 * Cache middleware for GET requests
 * Automatically checks cache before DB queries and sets X-Cache header
 */
export class CacheMiddleware {
  /**
   * Create a cache middleware for a specific endpoint
   * @param prefix - Cache key prefix (e.g., 'materials', 'users')
   * @param ttl - Time to live in seconds
   */
  static forEndpoint(prefix: string, ttl: number = 3600) {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Skip caching for specific query params
      if (req.query.nocache || req.headers['cache-control'] === 'no-cache') {
        return next();
      }

      const cacheKey = CacheService.generateCacheKey(prefix, req.params.id);

      try {
        const cached = await CacheService.getCached(cacheKey);
        if (cached) {
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Key', cacheKey);
          return res.status(200).json(cached);
        }
        res.set('X-Cache', 'MISS');
      } catch (error) {
        res.set('X-Cache', 'ERROR');
      }

      // Store original send method
      const originalSend = res.json.bind(res);

      // Override json method to cache response
      res.json = function (data: any) {
        // Only cache successful responses
        if (res.statusCode === 200 && data) {
          CacheService.setCached(cacheKey, data, ttl).catch(err =>
            console.error(`Failed to cache ${cacheKey}:`, err)
          );
        }
        return originalSend(data);
      };

      next();
    };
  }

  /**
   * Invalidate cache on mutations (POST, PUT, DELETE)
   * @param prefix - Cache key prefix to invalidate
   */
  static invalidateOnMutation(prefix: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Store original send
      const originalSend = res.json.bind(res);

      // Override json to invalidate cache after successful mutation
      res.json = function (data: any) {
        // Only invalidate on successful responses (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          CacheService.invalidateCachePrefix(prefix).catch(err =>
            console.error(`Failed to invalidate cache prefix ${prefix}:`, err)
          );
        }
        return originalSend(data);
      };

      next();
    };
  }

  /**
   * Set cache headers for browser caching
   * @param maxAge - Max age in seconds (default: 3600 = 1 hour)
   */
  static setResponseHeaders(maxAge: number = 3600) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'GET') {
        res.set('Cache-Control', `public, max-age=${maxAge}`);
        res.set('Pragma', 'public');

        // Add ETag for conditional requests
        const originalSend = res.json.bind(res);
        res.json = function (data: any) {
          const crypto = require('crypto');
          const hash = crypto
            .createHash('md5')
            .update(JSON.stringify(data))
            .digest('hex');
          res.set('ETag', `"${hash}"`);
          return originalSend(data);
        };
      } else {
        // Don't cache mutations
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
      }
      next();
    };
  }

  /**
   * Response size limiter
   * @param maxBytes - Maximum response size in bytes (default: 1MB)
   */
  static limitResponseSize(maxBytes: number = 1048576) {
    return (req: Request, res: Response, next: NextFunction) => {
      const originalSend = res.json.bind(res);

      res.json = function (data: any) {
        const size = Buffer.byteLength(JSON.stringify(data), 'utf8');
        if (size > maxBytes) {
          return res.status(413).json({
            error: 'Payload too large',
            message: `Response size ${size} bytes exceeds limit of ${maxBytes} bytes`,
            size,
            limit: maxBytes
          });
        }
        res.set('X-Response-Size', size.toString());
        return originalSend(data);
      };

      next();
    };
  }
}

export default CacheMiddleware;
