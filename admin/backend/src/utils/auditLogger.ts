import { Request } from 'express';
import { sequelize } from '../models';

/**
 * Extract client IP address from request
 */
export const getClientIP = (req?: Request): string => {
  if (!req) return 'unknown';
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

/**
 * Extract user agent from request
 */
export const getUserAgent = (req?: Request): string => {
  if (!req) return 'unknown';
  return req.headers['user-agent'] || 'unknown';
};

/**
 * Generic function to log admin actions
 */
export const logAdminAction = async (
  adminId: number | undefined,
  action: string,
  target: string | undefined,
  targetId: number | undefined,
  status: 'success' | 'failed',
  details?: any,
  req?: Request
) => {
  try {
    const SystemLog = (sequelize as any).models?.SystemLog;
    
    if (!SystemLog) {
      console.error('[AUDIT] SystemLog model not found');
      return;
    }

    const adminUsername = (req as any)?.admin?.username || 'unknown';
    
    const detailsObj = {
      ...details,
      adminUser: adminUsername
    };
    
    await SystemLog.create({
      userId: adminId || 999,
      action,
      target,
      targetId,
      status,
      details: JSON.stringify(detailsObj),
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error('[AUDIT] Failed to log action:', error.message);
    // Don't break main operation if logging fails
  }
};

/**
 * Admin Login
 */
export const logAdminLogin = async (adminUsername: string, req?: Request) => {
  await logAdminAction(undefined, 'ADMIN_LOGIN', 'admin', undefined, 'success', 
    { 
      action: 'Admin successfully logged in',
      username: adminUsername,
      sessionExpiry: '24 hours',
      environment: process.env.NODE_ENV || 'development'
    }, req);
};

/**
 * Admin Logout
 */
export const logAdminLogout = async (adminId: number, adminUsername: string, req?: Request) => {
  await logAdminAction(adminId, 'ADMIN_LOGOUT', 'admin', undefined, 'success', 
    { username: adminUsername }, req);
};

/**
 * User Management - Verification
 */
export const logUserVerified = async (
  adminId: number, 
  userId: number, 
  isVerified: boolean, 
  userEmail: string,
  req?: Request
) => {
  await logAdminAction(
    adminId,
    isVerified ? 'USER_VERIFIED' : 'USER_UNVERIFIED',
    'user',
    userId,
    'success',
    { 
      action: isVerified ? 'User account verified' : 'User account unverified',
      userEmail,
      userId,
      status: isVerified ? 'verified' : 'unverified'
    },
    req
  );
};

/**
 * User Management - Deletion
 */
export const logUserDeleted = async (
  adminId: number,
  userId: number,
  userEmail: string,
  userType: string,
  req?: Request
) => {
  await logAdminAction(
    adminId,
    'USER_DELETED',
    'user',
    userId,
    'success',
    { 
      action: 'User account permanently deleted',
      userEmail,
      userId,
      userType,
      deletedAt: new Date().toISOString()
    },
    req
  );
};

/**
 * Material - Creation
 */
export const logMaterialCreated = async (
  adminId: number,
  materialId: number,
  materialType: string,
  quantity: number,
  req?: Request
) => {
  await logAdminAction(
    adminId,
    'MATERIAL_CREATED',
    'material',
    materialId,
    'success',
    { 
      action: 'New material type added',
      materialId,
      materialType, 
      quantity,
      createdAt: new Date().toISOString()
    },
    req
  );
};

/**
 * Material - Update
 */
export const logMaterialUpdated = async (
  adminId: number,
  materialId: number,
  materialType: string,
  changes: any,
  req?: Request
) => {
  await logAdminAction(
    adminId,
    'MATERIAL_UPDATED',
    'material',
    materialId,
    'success',
    { 
      action: 'Material information updated',
      materialId,
      materialType, 
      changedFields: changes,
      updatedAt: new Date().toISOString()
    },
    req
  );
};

/**
 * Material - Deletion
 */
export const logMaterialDeleted = async (
  adminId: number,
  materialId: number,
  materialType: string,
  req?: Request
) => {
  await logAdminAction(
    adminId,
    'MATERIAL_DELETED',
    'material',
    materialId,
    'success',
    { 
      action: 'Material type permanently deleted',
      materialId,
      materialType,
      deletedAt: new Date().toISOString()
    },
    req
  );
};

/**
 * Waste Category - Creation
 */
export const logCategoryCreated = async (
  adminId: number,
  categoryId: number,
  categoryName: string,
  req?: Request
) => {
  await logAdminAction(
    adminId,
    'CATEGORY_CREATED',
    'waste_category',
    categoryId,
    'success',
    { 
      action: 'New waste category created',
      categoryId,
      categoryName,
      createdAt: new Date().toISOString()
    },
    req
  );
};

/**
 * Waste Category - Update
 */
export const logCategoryUpdated = async (
  adminId: number,
  categoryId: number,
  categoryName: string,
  changes: any,
  req?: Request
) => {
  await logAdminAction(
    adminId,
    'CATEGORY_UPDATED',
    'waste_category',
    categoryId,
    'success',
    { 
      action: 'Waste category information updated',
      categoryId,
      categoryName, 
      changedFields: changes,
      updatedAt: new Date().toISOString()
    },
    req
  );
};

/**
 * Waste Category - Deletion
 */
export const logCategoryDeleted = async (
  adminId: number,
  categoryId: number,
  categoryName: string,
  req?: Request
) => {
  await logAdminAction(
    adminId,
    'CATEGORY_DELETED',
    'waste_category',
    categoryId,
    'success',
    { 
      action: 'Waste category permanently deleted',
      categoryId,
      categoryName,
      deletedAt: new Date().toISOString()
    },
    req
  );
};

/**
 * Failed Action Logging
 */
export const logActionFailed = async (
  adminId: number | undefined,
  action: string,
  target: string,
  targetId: number | undefined,
  errorMessage: string,
  req?: Request
) => {
  await logAdminAction(
    adminId,
    action,
    target,
    targetId,
    'failed',
    { error: errorMessage },
    req
  );
};
