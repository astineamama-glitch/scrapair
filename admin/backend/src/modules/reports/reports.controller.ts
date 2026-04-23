import { Request, Response } from 'express';
import { sequelize } from '../../shared/db/index';
import {
  confirmReportValid,
  confirmReportInvalid,
  escalateReport,
  reverseReportConfirmation
} from './reports.service';

const NODE_ENV = process.env.NODE_ENV || 'development';

const getAllReports = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20, status, reason, reporterId, reportedUserId } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const Report = (sequelize as any).models.Report;
    const User = (sequelize as any).models.User;

    // Build where clause for filters
    const where: any = {};

    if (status && ['pending', 'under_review', 'valid_confirmed', 'invalid_confirmed', 'escalated'].includes(status as string)) {
      where.status = status;
    }

    if (reason) {
      where.reason = reason;
    }

    if (reporterId) {
      where.reporterId = parseInt(reporterId as string) || null;
    }

    if (reportedUserId) {
      where.reportedUserId = parseInt(reportedUserId as string) || null;
    }

    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'reportedUser',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName'],
          required: false
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
      distinct: true
    });

    res.status(200).json({
      message: 'Reports retrieved successfully',
      data: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ 
      message: 'Error fetching reports', 
      error: 'Failed to fetch reports',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

/**
 * Get a single report by ID
 */
const getReportById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const Report = (sequelize as any).models.Report;
    const User = (sequelize as any).models.User;

    const report = await Report.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reportedUser',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName']
        }
      ]
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({
      message: 'Report retrieved successfully',
      data: report
    });
  } catch (error: any) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      message: 'Error fetching report',
      error: NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Confirm report as valid and apply rating deduction
 */
const confirmReportAsValid = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { deductionPercentage, adminNotes, useAutoDeduction = true } = req.body;
    const adminId = (req as any).admin?.id;

    console.log('[CONTROLLER] Attempting to confirm report as invalid');
    console.log('[CONTROLLER] req.admin:', (req as any).admin);
    console.log('[CONTROLLER] adminId:', adminId);

    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized - Admin ID required' });
    }

    if (!adminNotes || adminNotes.trim().length === 0) {
      return res.status(400).json({ message: 'Admin notes are required' });
    }

    const result = await confirmReportValid({
      reportId: parseInt(id),
      adminId,
      deductionPercentage,
      adminNotes,
      useAutoDeduction
    });

    res.status(200).json({
      message: 'Report confirmed as valid',
      data: result
    });
  } catch (error: any) {
    console.error('Error confirming report:', error);
    res.status(500).json({
      message: 'Error confirming report',
      error: NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Confirm report as invalid (not valid)
 */
const confirmReportAsInvalid = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { rejectionReason, adminNotes } = req.body;
    const adminId = (req as any).admin?.id;

    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized - Admin ID required' });
    }

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const result = await confirmReportInvalid({
      reportId: parseInt(id),
      adminId,
      rejectionReason,
      adminNotes: adminNotes || ''
    });

    res.status(200).json({
      message: 'Report confirmed as invalid',
      data: result
    });
  } catch (error: any) {
    console.error('Error confirming report as invalid:', error);
    res.status(500).json({
      message: 'Error confirming report',
      error: NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Escalate report for higher level review
 */
const escalateReportStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminId = (req as any).admin?.id;

    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized - Admin ID required' });
    }

    if (!adminNotes || adminNotes.trim().length === 0) {
      return res.status(400).json({ message: 'Admin notes are required for escalation' });
    }

    const result = await escalateReport(parseInt(id), adminId, adminNotes);

    res.status(200).json({
      message: 'Report escalated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error escalating report:', error);
    res.status(500).json({
      message: 'Error escalating report',
      error: NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Reverse a valid report confirmation
 */
const reverseReportValid = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).admin?.id;

    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized - Admin ID required' });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Reason for reversal is required' });
    }

    const result = await reverseReportConfirmation(parseInt(id), adminId, reason);

    res.status(200).json({
      message: 'Report confirmation reversed',
      data: result
    });
  } catch (error: any) {
    console.error('Error reversing report:', error);
    res.status(500).json({
      message: 'Error reversing report',
      error: NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export {
  getAllReports,
  getReportById,
  confirmReportAsValid,
  confirmReportAsInvalid,
  escalateReportStatus,
  reverseReportValid
};
