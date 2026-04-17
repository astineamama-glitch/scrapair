/**
 * User roles and role constants
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  BUSINESS: 'business',
  RECYCLER: 'recycler',
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.BUSINESS]: 'Business',
  [USER_ROLES.RECYCLER]: 'Recycler',
};

export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.ADMIN]: 'System administrator with full access',
  [USER_ROLES.BUSINESS]: 'Business user - post waste materials',
  [USER_ROLES.RECYCLER]: 'Recycler user - browse and collect materials',
};

// Route prefixes for each role
export const ROLE_ROUTES = {
  [USER_ROLES.ADMIN]: '/admin',
  [USER_ROLES.BUSINESS]: '/business',
  [USER_ROLES.RECYCLER]: '/recycler',
};

export default USER_ROLES;
