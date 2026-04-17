import { PasswordAudit } from '../models';
import { Request } from 'express';

/**
 * UTILITY FOR PASSWORD AUDIT LOGGING
 * Tracks all password changes for security auditing
 */

export const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

export const getUserAgent = (req: Request): string => {
  return (req.headers['user-agent'] || 'unknown').substring(0, 500); // Limit to 500 chars
};

export const logPasswordAudit = async (
  userId: number,
  email: string,
  type: 'business' | 'recycler',
  changeType: 'reset' | 'change',
  req: Request,
  status: 'success' | 'failed' = 'success',
  reason?: string
): Promise<void> => {
  try {
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    await PasswordAudit.create({
      userId,
      email,
      type,
      changeType,
      ipAddress,
      userAgent,
      status,
      reason
    });
  } catch (error) {
    // Don't throw error - audit logging shouldn't break the flow
  }
};

export const getPasswordChangeHistory = async (userId: number, limit: number = 10) => {
  try {
    const audits = await PasswordAudit.findAll({
      where: { userId, status: 'success' },
      order: [['createdAt', 'DESC']],
      limit,
      attributes: ['id', 'changeType', 'ipAddress', 'createdAt', 'userAgent']
    });
    
    return audits;
  } catch (error) {
    return [];
  }
};

export const getRecentPasswordResetAttempts = async (email: string, minutesBack: number = 60) => {
  try {
    const timeThreshold = new Date(Date.now() - minutesBack * 60 * 1000);
    
    const attempts = await PasswordAudit.findAll({
      where: {
        email,
        changeType: 'reset',
        createdAt: {
          [require('sequelize').Op.gte]: timeThreshold
        }
      },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'ipAddress', 'status', 'createdAt']
    });
    
    return attempts;
  } catch (error) {
    return [];
  }
};

export const countFailedPasswordAttempts = async (email: string, minutesBack: number = 60): Promise<number> => {
  try {
    const timeThreshold = new Date(Date.now() - minutesBack * 60 * 1000);
    
    const count = await PasswordAudit.count({
      where: {
        email,
        changeType: 'reset',
        status: 'failed',
        createdAt: {
          [require('sequelize').Op.gte]: timeThreshold
        }
      }
    });
    
    return count;
  } catch (error) {
    return 0;
  }
};

