/**
 * API Endpoint constants
 */

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  REFRESH_TOKEN: '/auth/refresh-token',
};

// User endpoints
export const USER_ENDPOINTS = {
  GET_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  DELETE_ACCOUNT: '/users/account',
};

// Waste Post endpoints
export const WASTE_POST_ENDPOINTS = {
  GET_ALL: '/waste-posts',
  GET_MY_POSTS: '/waste-posts/user/mine',
  GET_MY_APPROVED: '/waste-posts/my-approved',
  GET_CATEGORIES: '/waste-posts/categories',
  CREATE: '/waste-posts',
  GET_BY_ID: (id) => `/waste-posts/${id}`,
  UPDATE: (id) => `/waste-posts/${id}`,
  DELETE: (id) => `/waste-posts/${id}`,
};

// Collection endpoints
export const COLLECTION_ENDPOINTS = {
  GET_ALL: '/collections',
  GET_MY_COLLECTIONS: '/collections/my-collections',
  CREATE: '/collections',
  GET_BY_ID: (id) => `/collections/${id}`,
  UPDATE: (id) => `/collections/${id}`,
  APPROVE: (id) => `/collections/${id}/approve`,
  REJECT: (id) => `/collections/${id}/reject`,
};

// Conversation endpoints
export const CONVERSATION_ENDPOINTS = {
  GET_ALL: '/conversations',
  CREATE: '/conversations',
  GET_BY_ID: (id) => `/conversations/${id}`,
};

// Message endpoints
export const MESSAGE_ENDPOINTS = {
  GET_BY_CONVERSATION: (conversationId) => `/messages?conversationId=${conversationId}`,
  CREATE: '/messages',
};

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  GET_ALL: '/notifications',
  MARK_AS_READ: (id) => `/notifications/${id}/read`,
};

// Rating endpoints
export const RATING_ENDPOINTS = {
  GET_ALL: '/ratings',
  CREATE: '/ratings',
};

// Material endpoints
export const MATERIAL_ENDPOINTS = {
  GET_ALL: '/materials',
};

// Image endpoints
export const IMAGE_ENDPOINTS = {
  UPLOAD: '/images/upload',
  DELETE: (id) => `/images/${id}`,
};

export default {
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  WASTE_POST_ENDPOINTS,
  COLLECTION_ENDPOINTS,
  CONVERSATION_ENDPOINTS,
  MESSAGE_ENDPOINTS,
  NOTIFICATION_ENDPOINTS,
  RATING_ENDPOINTS,
  MATERIAL_ENDPOINTS,
  IMAGE_ENDPOINTS,
};
