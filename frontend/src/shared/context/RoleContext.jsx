import React, { createContext } from 'react';
import { useAuthContext } from './AuthContext';
import { USER_ROLES } from '../constants/roles';

export const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const { user } = useAuthContext();

  const userRole = user?.type || null;
  const isAdmin = userRole === USER_ROLES.ADMIN;
  const isBusiness = userRole === USER_ROLES.BUSINESS;
  const isRecycler = userRole === USER_ROLES.RECYCLER;

  const canAccess = (allowedRoles) => {
    return allowedRoles.includes(userRole);
  };

  const value = {
    role: userRole,
    isAdmin,
    isBusiness,
    isRecycler,
    canAccess,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

// Hook to use RoleContext
export const useRoleContext = () => {
  const context = React.useContext(RoleContext);
  if (!context) {
    throw new Error('useRoleContext must be used within RoleProvider');
  }
  return context;
};

export default RoleContext;
