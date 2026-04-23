export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/api/admin/login',

  // Users
  USERS_GET_ALL: '/api/admin/users',
  USERS_GET_BY_ID: (id) => `/api/admin/users/${id}`,
  USERS_VERIFY: (id) => `/api/admin/users/${id}/verify`,
  USERS_DELETE: (id) => `/api/admin/users/${id}`,

  // Ratings
  RATINGS_USERS: '/api/admin/ratings/users',
  RATINGS_POSTS: '/api/admin/ratings/posts',

  // Reports
  REPORTS_GET_ALL: '/api/admin/reports',

  // Monitoring
  MONITORING_LOGS: '/api/admin/logs',

  // Dashboard
  DASHBOARD_STATISTICS: '/api/admin/statistics'
};
