import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';
import { rateLimitConfig } from '../config/rateLimits';
import redisClient from '../config/redis';

export type LimitType = keyof typeof rateLimitConfig;

export class RateLimiter {
  static async checkLimit(
    userId: string,
    ip: string,
    limitType: LimitType
  ): Promise<boolean> {
    const config = rateLimitConfig[limitType];
    if (!config) {
      console.warn(`Unknown rate limit type: ${limitType}`);
      return true;
    }

    const keys = config.keyGenerator(userId, ip);

    try {
      const userCount = await redisClient.incr(keys.user);
      if (userCount === 1) {
        await redisClient.expire(keys.user, Math.ceil(config.windowMs / 1000));
      }

      if (userCount > config.maxPerUser) {
        return false; 
      }

      const ipCount = await redisClient.incr(keys.ip);
      if (ipCount === 1) {
        await redisClient.expire(keys.ip, Math.ceil(config.windowMs / 1000));
      }

      if (ipCount > config.maxPerIP) {
        return false;
      }

      return true; 
    } catch (error) {
      return true;
    }
  }

  static middleware(limitType: LimitType) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as any).user?.id || 'anonymous';
      const ip = req.ip || 'unknown';

      const allowed = await this.checkLimit(userId, ip, limitType);

      if (!allowed) {
        const config = rateLimitConfig[limitType];
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded for ${limitType}`,
          retryAfter: Math.ceil(config.windowMs / 1000),
          limit: {
            maxPerUser: config.maxPerUser,
            windowMs: config.windowMs
          }
        });
      }

      return next();
    };
  }

  static async resetLimit(
    userId: string,
    limitType: LimitType
  ): Promise<void> {
    const config = rateLimitConfig[limitType];
    if (!config) return;

    const keys = config.keyGenerator(userId, '');

    try {
      await redisClient.del(keys.user);
    } catch (error) {
      console.error(`Failed to reset limit ${limitType}:`, error);
    }
  }

  static async getStatus(
    userId: string,
    ip: string,
    limitType: LimitType
  ): Promise<{
    userCount: number;
    ipCount: number;
    maxPerUser: number;
    maxPerIP: number;
    windowMs: number;
  }> {
    const config = rateLimitConfig[limitType];
    if (!config) {
      return {
        userCount: 0,
        ipCount: 0,
        maxPerUser: 0,
        maxPerIP: 0,
        windowMs: 0
      };
    }

    const keys = config.keyGenerator(userId, ip);

    try {
      const userCount = parseInt((await redisClient.get(keys.user)) || '0');
      const ipCount = parseInt((await redisClient.get(keys.ip)) || '0');

      return {
        userCount,
        ipCount,
        maxPerUser: config.maxPerUser,
        maxPerIP: config.maxPerIP,
        windowMs: config.windowMs
      };
    } catch (error) {
      return {
        userCount: 0,
        ipCount: 0,
        maxPerUser: config.maxPerUser,
        maxPerIP: config.maxPerIP,
        windowMs: config.windowMs
      };
    }
  }
}

export default RateLimiter;

