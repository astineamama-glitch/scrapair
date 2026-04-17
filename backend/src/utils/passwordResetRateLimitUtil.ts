import { redisClient } from '../config/redis';

/**
 * RATE LIMITING UTILITY FOR PASSWORD RESETS
 * Multi-level rate limiting to prevent abuse
 */

export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  resetTime: number; // Unix timestamp when limit resets
  reason?: string;
}

/**
 * Check password reset rate limits
 * Enforces multiple layers:
 * - Per IP: 3 attempts in 15 minutes
 * - Per Email: 5 attempts in 1 hour
 * - Per IP+Email: 2 attempts in 24 hours
 */
export const checkPasswordResetRateLimit = async (
  email: string,
  ipAddress: string
): Promise<RateLimitCheckResult> => {
  try {
    const now = Date.now();
    
    // Check 1: Per IP limit (3 per 15 minutes)
    const ipKey = `pwd_reset_ip:${ipAddress}`;
    const ipAttempts = await redisClient.incr(ipKey);
    if (ipAttempts === 1) {
      await redisClient.expire(ipKey, 15 * 60); // 15 minutes
    }
    
    if (ipAttempts > 3) {
      const ttl = await redisClient.ttl(ipKey);
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + ttl * 1000,
        reason: `Too many reset attempts from this IP. Try again in ${ttl} seconds.`
      };
    }

    // Check 2: Per Email limit (5 per 1 hour)
    const emailKey = `pwd_reset_email:${email}`;
    const emailAttempts = await redisClient.incr(emailKey);
    if (emailAttempts === 1) {
      await redisClient.expire(emailKey, 60 * 60); // 1 hour
    }
    
    if (emailAttempts > 5) {
      const ttl = await redisClient.ttl(emailKey);
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + ttl * 1000,
        reason: `Too many reset attempts for this email. Try again in ${ttl} seconds.`
      };
    }

    // Check 3: Per IP+Email combo (2 per 24 hours)
    const comboKey = `pwd_reset_combo:${email}:${ipAddress}`;
    const comboAttempts = await redisClient.incr(comboKey);
    if (comboAttempts === 1) {
      await redisClient.expire(comboKey, 24 * 60 * 60); // 24 hours
    }
    
    if (comboAttempts > 2) {
      const ttl = await redisClient.ttl(comboKey);
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + ttl * 1000,
        reason: `Suspicious activity detected. This account cannot reset from this location right now. Try again in ${ttl} seconds.`
      };
    }

    // All checks passed
    return {
      allowed: true,
      remaining: Math.min(
        3 - ipAttempts,
        5 - emailAttempts,
        2 - comboAttempts
      ),
      resetTime: 0
    };
  } catch (error) {
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: 1,
      resetTime: 0,
      reason: 'Rate limit check failed - allowing request'
    };
  }
};

/**
 * Clear rate limit for a user (after successful reset or for admin)
 */
export const clearPasswordResetRateLimit = async (email: string, ipAddress?: string): Promise<void> => {
  try {
    await redisClient.del(`pwd_reset_email:${email}`);
    
    if (ipAddress) {
      await redisClient.del(`pwd_reset_ip:${ipAddress}`);
      await redisClient.del(`pwd_reset_combo:${email}:${ipAddress}`);
    }
  } catch (error) {
  }
};

/**
 * Get current rate limit status for debugging/monitoring
 */
export const getPasswordResetRateLimitStatus = async (email: string, ipAddress: string) => {
  try {
    const ipAttempts = await redisClient.get(`pwd_reset_ip:${ipAddress}`);
    const emailAttempts = await redisClient.get(`pwd_reset_email:${email}`);
    const comboAttempts = await redisClient.get(`pwd_reset_combo:${email}:${ipAddress}`);
    
    const ipTtl = await redisClient.ttl(`pwd_reset_ip:${ipAddress}`);
    const emailTtl = await redisClient.ttl(`pwd_reset_email:${email}`);
    const comboTtl = await redisClient.ttl(`pwd_reset_combo:${email}:${ipAddress}`);

    return {
      ipAttempts: parseInt(ipAttempts || '0'),
      ipTtl: ipTtl > 0 ? ipTtl : 0,
      emailAttempts: parseInt(emailAttempts || '0'),
      emailTtl: emailTtl > 0 ? emailTtl : 0,
      comboAttempts: parseInt(comboAttempts || '0'),
      comboTtl: comboTtl > 0 ? comboTtl : 0
    };
  } catch (error) {
    return {
      ipAttempts: 0,
      ipTtl: 0,
      emailAttempts: 0,
      emailTtl: 0,
      comboAttempts: 0,
      comboTtl: 0
    };
  }
};

