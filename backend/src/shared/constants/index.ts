// Shared Constants - Common values used across modules

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_INPUT: 'Invalid input provided',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
  CONFLICT: 'Resource already exists',
  FORBIDDEN: 'Access forbidden',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PASSWORD: 'Password must be at least 8 characters',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid username or password'
};

export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  FETCHED: 'Resource fetched successfully',
  LOGIN: 'Login successful',
  LOGOUT: 'Logout successful'
};

export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MIN_EMAIL_LENGTH: 5,
  MAX_EMAIL_LENGTH: 100
};

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100
};

export const CACHE_EXPIRY = {
  SHORT: 300,        // 5 minutes
  MEDIUM: 3600,      // 1 hour
  LONG: 86400,       // 24 hours
  VERY_LONG: 604800  // 7 days
};

export const ROLES = ['user', 'business', 'recycler', 'admin'];

export const NOTIFICATION_TYPES = [
  'collection_request',
  'message',
  'rating',
  'review',
  'report',
  'system'
];
