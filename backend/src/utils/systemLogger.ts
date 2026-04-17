import { Request } from 'express';
import { sequelize } from '../models';

export const getClientIP = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

export const getUserAgent = (req: Request): string => {
  return req.headers['user-agent'] || 'unknown';
};

export const logSystemAction = async (
  userId: number | undefined,
  action: string,
  target: string | undefined,
  targetId: number | undefined,
  status: 'success' | 'failed',
  details?: any,
  req?: Request
) => {
  try {
    const SystemLog = (sequelize as any).models.SystemLog;
    
    await SystemLog.create({
      userId: userId || null,
      action,
      target,
      targetId,
      status,
      details: details ? JSON.stringify(details) : null,
      ipAddress: req ? getClientIP(req) : null,
      userAgent: req ? getUserAgent(req) : null,
      timestamp: new Date()
    });
  } catch (error) {
  }
};

export const logUserLogin = async (userId: number, req?: Request) => {
  await logSystemAction(userId, 'USER_LOGIN', 'user', userId, 'success', undefined, req);
};
export const logUserLogout = async (userId: number, req?: Request) => {
  await logSystemAction(userId, 'USER_LOGOUT', 'user', userId, 'success', undefined, req);
};
export const logWastePostCreated = async (userId: number, postId: number, req?: Request) => {
  await logSystemAction(userId, 'WASTE_POST_CREATED', 'waste_post', postId, 'success', undefined, req);
};
export const logWastePostUpdated = async (userId: number, postId: number, req?: Request) => {
  await logSystemAction(userId, 'WASTE_POST_UPDATED', 'waste_post', postId, 'success', undefined, req);
};
export const logCollectionRequested = async (userId: number, collectionId: number, req?: Request) => {
  await logSystemAction(userId, 'COLLECTION_REQUESTED', 'collection', collectionId, 'success', undefined, req);
};
export const logAdminDeactivateUser = async (adminId: number, targetUserId: number, req?: Request) => {
  await logSystemAction(adminId, 'ADMIN_DEACTIVATE_USER', 'user', targetUserId, 'success', undefined, req);
};
export const logAdminReactivateUser = async (adminId: number, targetUserId: number, req?: Request) => {
  await logSystemAction(adminId, 'ADMIN_REACTIVATE_USER', 'user', targetUserId, 'success', undefined, req);
};
export const logWasteCategoryChanged = async (adminId: number, action: string, categoryId: number, req?: Request) => {
  await logSystemAction(adminId, `WASTE_CATEGORY_${action}`, 'waste_category', categoryId, 'success', undefined, req);
};
export const logReportSubmitted = async (userId: number, reportId: number, req?: Request) => {
  await logSystemAction(userId, 'REPORT_SUBMITTED', 'report', reportId, 'success', undefined, req);
};
export const logReportApproved = async (adminId: number, reportId: number, req?: Request) => {
  await logSystemAction(adminId, 'REPORT_APPROVED', 'report', reportId, 'success', undefined, req);
};
export const logReportRejected = async (adminId: number, reportId: number, req?: Request) => {
  await logSystemAction(adminId, 'REPORT_REJECTED', 'report', reportId, 'success', undefined, req);
};
export const logFeedbackSubmitted = async (userId: number, feedbackId: number, req?: Request) => {
  await logSystemAction(userId, 'FEEDBACK_SUBMITTED', 'feedback', feedbackId, 'success', undefined, req);
};

