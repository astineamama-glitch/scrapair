import { Request, Response } from 'express';
import { sequelize } from '../../models';
import { validateReportReason, shouldAutoApprove, getPointDeduction } from '../../utils/reportValidator';
import { logReportSubmitted, logReportApproved, logReportRejected } from '../../utils/systemLogger';

export const submitReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const { reportedUserId, collectionId, postId, reason, description } = req.body;
    const reporterId = req.user?.id;

    if (!reportedUserId || !reason || !description) {
      return res.status(400).json({ message: 'Missing required fields: reportedUserId, reason, description' });
    }

    if (reporterId === reportedUserId) {
      return res.status(400).json({ message: 'You cannot report yourself' });
    }

    const Report = (sequelize as any).models.Report;
    const WastePost = (sequelize as any).models.WastePost;
    const Collection = (sequelize as any).models.Collection;

    let wasteType: string | undefined;
    if (postId) {
      const post = await WastePost.findByPk(postId, { attributes: ['wasteType'] });
      wasteType = post?.wasteType;
    } else if (collectionId) {
      const collection = await Collection.findByPk(collectionId, {
        include: [{ model: WastePost, as: 'post', attributes: ['wasteType'] }]
      });
      wasteType = (collection as any)?.post?.wasteType;
    }

    const validation = validateReportReason(reason, description, wasteType);

    const report = await Report.create({
      reporterId,
      reportedUserId,
      collectionId: collectionId || null,
      postId: postId || null,
      reason,
      description,
      validityScore: validation.validityScore,
      pointsDeducted: validation.pointsDeduction,
      status: shouldAutoApprove(reason, validation.validityScore, validation.pointsDeduction) ? 'valid_confirmed' : 'pending',
      isValid: validation.isValid && validation.validityScore >= 0.4
    });

    if (report.status === 'valid_confirmed') {
      await processReportApproval(reportedUserId, report.id);
    }

    await logReportSubmitted(reporterId !, report.id, req);

    res.status(201).json({
      message: `Report submitted successfully. ${report.status === 'valid_confirmed' ? 'Auto-approved and processed.' : 'Awaiting admin review.'}`,
      data: {
        report: {
          id: report.id,
          status: report.status,
          validityScore: validation.validityScore,
          validationReason: validation.reasoning
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error submitting report', error: error.message });
  }
};

const processReportApproval = async (reportedUserId: number, reportId: number) => {
  try {
    const Report = (sequelize as any).models.Report;
    const UserRating = (sequelize as any).models.UserRating;

    const report = await Report.findByPk(reportId);
    if (!report || !report.pointsDeducted) return;

    let userRating = await UserRating.findOne({ where: { userId: reportedUserId } });

    if (userRating) {
      userRating.averageRating = Math.max(1.0, userRating.averageRating - report.pointsDeducted);
      await userRating.save();
    }
  } catch (error) {
  }
};

export const getPendingReports = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20, reason } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const Report = (sequelize as any).models.Report;
    const User = (sequelize as any).models.User;

    const where: any = { status: 'pending' };
    if (reason) where.reason = reason;

    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName']
        },
        {
          model: User,
          as: 'reportedUser',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit as number,
      offset
    });

    res.status(200).json({
      message: 'Pending reports retrieved successfully',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / (limit as number))
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching pending reports', error: error.message });
  }
};

export const approveReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const { reportId } = req.params;
    const adminId = req.user?.id;

    const Report = (sequelize as any).models.Report;
    const UserRating = (sequelize as any).models.UserRating;

    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending reports can be approved' });
    }

    report.status = 'valid_confirmed';
    report.isValid = true;
    report.approvedBy = adminId;
    report.approvedAt = new Date();
    await report.save();

    if (report.pointsDeducted > 0) {
      let userRating = await UserRating.findOne({ where: { userId: report.reportedUserId } });

      if (userRating) {
        userRating.averageRating = Math.max(1.0, userRating.averageRating - report.pointsDeducted);
        await userRating.save();
      }
    }

    await logReportApproved(adminId !, parseInt(reportId), req);

    res.status(200).json({
      message: 'Report approved and points deducted from user rating',
      data: {
        reportId,
        pointsDeducted: report.pointsDeducted,
        status: 'valid_confirmed'
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error approving report', error: error.message });
  }
};

export const rejectReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const { reportId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user?.id;

    const Report = (sequelize as any).models.Report;

    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending reports can be rejected' });
    }

    report.status = 'invalid_confirmed';
    report.isValid = false;
    report.approvedBy = adminId;
    report.approvedAt = new Date();
    report.rejectionReason = rejectionReason || null;
    report.pointsDeducted = 0;
    await report.save();

    await logReportRejected(adminId !, parseInt(reportId), req);

    res.status(200).json({
      message: 'Report rejected',
      data: {
        reportId,
        status: 'invalid_confirmed',
        reason: rejectionReason || null
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error rejecting report', error: error.message });
  }
};

export const getAllReports = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20, status, reason, reportedUserId } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const Report = (sequelize as any).models.Report;
    const User = (sequelize as any).models.User;

    const where: any = {};
    if (status) where.status = status;
    if (reason) where.reason = reason;
    if (reportedUserId) where.reportedUserId = reportedUserId;

    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName']
        },
        {
          model: User,
          as: 'reportedUser',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit as number,
      offset
    });

    res.status(200).json({
      message: 'Reports retrieved successfully',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / (limit as number))
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

export const getUserReports = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const Report = (sequelize as any).models.Report;
    const User = (sequelize as any).models.User;

    const { count, rows } = await Report.findAndCountAll({
      where: {
        reportedUserId: userId,
        status: 'approved'
      },
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'email', 'type'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit as number,
      offset
    });

    res.status(200).json({
      message: 'Your reports retrieved successfully',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / (limit as number))
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user reports', error: error.message });
  }
};
