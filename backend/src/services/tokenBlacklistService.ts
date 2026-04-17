import redis from '../config/redis';

/**
 * Blacklist a token (invalidate it on logout)
 * Token stays blacklisted for duration matching JWT expiry
 * @param token JWT token to blacklist
 * @param expiryTime Duration in seconds (default: 7 days)
 */
export const blacklistToken = async (
  token: string,
  expiryTime: number = 7 * 24 * 60 * 60
): Promise<void> => {
  const key = `blacklist:${token}`;

  try {
    // Store token in Redis with expiry to match JWT expiry
    await redis.setex(key, expiryTime, 'true');
  } catch (error) {
    // Don't crash - fallback to normal operation
    throw error;
  }
};

/**
 * Check if a token is blacklisted
 * @param token JWT token to check
 * @returns true if token is blacklisted, false otherwise
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const key = `blacklist:${token}`;

  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    // If Redis fails, don't block user - fallback to accepting token
    return false;
  }
};

/**
 * Clear a token from blacklist (rarely needed)
 * @param token JWT token to remove from blacklist
 */
export const removeTokenFromBlacklist = async (token: string): Promise<void> => {
  const key = `blacklist:${token}`;

  try {
    await redis.del(key);
  } catch (error) {
  }
};

