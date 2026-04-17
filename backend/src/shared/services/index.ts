// Shared Services - Used by multiple modules
// Export commonly used services that are independent of specific features

export { default as CacheService } from '../../services/cacheService';
export * as emailService from '../../services/emailService';
export { initializeSocket } from '../../services/socketService';
export * as tokenBlacklistService from '../../services/tokenBlacklistService';

// Logger - shared logging
const logger = process.env.NODE_ENV === 'production'
  ? require('../../config/logger.prod').default
  : require('../../config/logger.dev').default;

export { logger };
