export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/admin/login',

  // Users
  USERS_GET_ALL: '/admin/users',
  USERS_GET_BY_ID: (id) => `/admin/users/${id}`,
  USERS_VERIFY: (id) => `/admin/users/${id}/verify`,
  USERS_DELETE: (id) => `/admin/users/${id}`,

  // Ratings
  RATINGS_USERS: '/admin/ratings/users',
  RATINGS_POSTS: '/admin/ratings/posts',

  // Reports
  REPORTS_GET_ALL: '/admin/reports',

  // Monitoring
  MONITORING_LOGS: '/admin/logs',

  // Dashboard
  DASHBOARD_STATISTICS: '/admin/statistics'
};
