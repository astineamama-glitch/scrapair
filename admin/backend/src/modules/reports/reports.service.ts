/**
 * Reports Service
 * Handles business logic for report management
 */

import { sequelize } from '../../shared/db/index';

interface ConfirmReportValidInput {
  reportId: number;
  adminId: number;
  deductionPercentage?: number;
  adminNotes: string;
  useAutoDeduction?: boolean;
}

interface ConfirmReportInvalidInput {
  reportId: number;
  adminId: number;
  rejectionReason: string;
  adminNotes?: string;
}

/**
 * Get severity level based on report reason
 */
export const getSeverityFromReason = async (reason: string): Promise<'low' | 'medium' | 'high' | 'critical'> => {
  try {
    const RatingDeductionRule = (sequelize as any).models.RatingDeductionRule;
    const rule = await RatingDeductionRule.findOne({ where: { reason } });
    return rule?.severityLevel || 'low';
  } catch (error) {
    console.error('Error getting severity from reason:', error);
    return 'low';
  }
};

/**
 * Get deduction percentage based on reason
 */
export const getDeductionPercentageFromReason = async (reason: string): Promise<number> => {
  try {
    const RatingDeductionRule = (sequelize as any).models.RatingDeductionRule;
    const rule = await RatingDeductionRule.findOne({ where: { reason } });
    return rule?.defaultDeductionPercentage || 10;
  } catch (error) {
    console.error('Error getting deduction percentage:', error);
    return 10;
  }
};

/**
 * Calculate new rating after deduction
 */
export const calculateNewRating = (currentRating: number, deductionPercentage: number): number => {
  const deductionAmount = (deductionPercentage / 100) * 5.0; // 5.0 is default starting rating
  const newRating = Math.max(1.0, currentRating - deductionAmount); // Min rating is 1.0
  return Math.round(newRating * 100) / 100; // Round to 2 decimal places
};

/**
 * Confirm report as valid and apply rating deduction
 */
export const confirmReportValid = async (input: ConfirmReportValidInput) => {
  const { reportId, adminId, deductionPercentage: customDeduction, adminNotes, useAutoDeduction = true } = input;

  try {
    const Report = (sequelize as any).models.Report;
    const UserRating = (sequelize as any).models.UserRating;
    const RatingHistory = (sequelize as any).models.RatingHistory;
    const RatingDeductionRule = (sequelize as any).models.RatingDeductionRule;

    // Start transaction
    const t = await sequelize.transaction();

    try {
      // Get the report
      const report = await Report.findByPk(reportId, { transaction: t });
      if (!report) {
        throw new Error('Report not found');
      }

      if (report.status !== 'pending' && report.status !== 'under_review') {
        throw new Error('Report cannot be confirmed - invalid status');
      }

      // Get deduction percentage
      let deductionPercent = customDeduction;
      if (!deductionPercent || useAutoDeduction) {
        deductionPercent = await getDeductionPercentageFromReason(report.reason);
      }

      // Get severity level
      const severity = await getSeverityFromReason(report.reason);

      // Get user rating
      let userRating = await UserRating.findOne(
        { where: { userId: report.reportedUserId }, transaction: t },
        { lock: t.LOCK.UPDATE }
      );

      if (!userRating) {
        // Create new user rating if doesn't exist
        userRating = await UserRating.create(
          { userId: report.reportedUserId, averageRating: 5.0, totalRatings: 0, totalFeedback: 0 },
          { transaction: t }
        );
      }

      const previousRating = userRating.averageRating;
      const deductionAmount = (deductionPercent / 100) * 5.0;
      const newRating = calculateNewRating(previousRating, deductionPercent);

      // Update user rating
      await userRating.update(
        {
          averageRating: newRating
        },
        { transaction: t }
      );

      // Update report
      await report.update(
        {
          status: 'valid_confirmed',
          isValid: true,
          severity,
          adminNotes,
          approvedBy: adminId,
          approvedAt: new Date(),
          pointsDeducted: deductionAmount
        },
        { transaction: t }
      );

      // Create rating history entry
      await RatingHistory.create(
        {
          userId: report.reportedUserId,
          previousRating,
          newRating,
          changedBy: adminId,
          reason: 'report_valid',
          sourceId: reportId,
          sourceType: 'report',
          adminNotes: `Report confirmed as valid. Deduction: ${deductionPercent}% (${deductionAmount.toFixed(2)} points). Reason: ${report.reason}`
        },
        { transaction: t }
      );

      // Commit transaction
      await t.commit();

      return {
        success: true,
        report: await Report.findByPk(reportId, { include: [{ model: (sequelize as any).models.User, as: 'reporter' }, { model: (sequelize as any).models.User, as: 'reportedUser' }] }),
        userRating: await UserRating.findOne({ where: { userId: report.reportedUserId } }),
        deductionApplied: {
          percentage: deductionPercent,
          amount: deductionAmount,
          previousRating,
          newRating
        }
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error: any) {
    console.error('Error confirming report as valid:', error);
    throw error;
  }
};

/**
 * Confirm report as invalid
 */
export const confirmReportInvalid = async (input: ConfirmReportInvalidInput) => {
  const { reportId, adminId, rejectionReason, adminNotes } = input;

  try {
    const Report = (sequelize as any).models.Report;

    const report = await Report.findByPk(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    if (report.status !== 'pending' && report.status !== 'under_review') {
      throw new Error('Report cannot be confirmed - invalid status');
    }

    // Update report
    await report.update({
      status: 'invalid_confirmed',
      isValid: false,
      approvedBy: adminId,
      approvedAt: new Date(),
      rejectionReason,
      adminNotes
    });

    return {
      success: true,
      report: await Report.findByPk(reportId, {
        include: [
          { model: (sequelize as any).models.User, as: 'reporter' },
          { model: (sequelize as any).models.User, as: 'reportedUser' }
        ]
      })
    };
  } catch (error: any) {
    console.error('Error confirming report as invalid:', error);
    throw error;
  }
};

/**
 * Escalate report for higher review
 */
export const escalateReport = async (reportId: number, adminId: number, adminNotes: string) => {
  try {
    const Report = (sequelize as any).models.Report;

    const report = await Report.findByPk(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    await report.update({
      status: 'escalated',
      approvedBy: adminId,
      adminNotes
    });

    return {
      success: true,
      report: await Report.findByPk(reportId, {
        include: [
          { model: (sequelize as any).models.User, as: 'reporter' },
          { model: (sequelize as any).models.User, as: 'reportedUser' }
        ]
      })
    };
  } catch (error: any) {
    console.error('Error escalating report:', error);
    throw error;
  }
};

/**
 * Reverse a valid report confirmation (restore rating)
 */
export const reverseReportConfirmation = async (reportId: number, adminId: number, reason: string) => {
  try {
    const Report = (sequelize as any).models.Report;
    const UserRating = (sequelize as any).models.UserRating;
    const RatingHistory = (sequelize as any).models.RatingHistory;

    const t = await sequelize.transaction();

    try {
      const report = await Report.findByPk(reportId, { transaction: t });
      if (!report) {
        throw new Error('Report not found');
      }

      if (report.status !== 'valid_confirmed') {
        throw new Error('Only valid_confirmed reports can be reversed');
      }

      const userRating = await UserRating.findOne(
        { where: { userId: report.reportedUserId }, transaction: t },
        { lock: t.LOCK.UPDATE }
      );

      if (!userRating) {
        throw new Error('User rating not found');
      }

      const previousRating = userRating.averageRating;
      const deductionAmount = report.pointsDeducted || 0;
      const newRating = Math.min(5.0, previousRating + deductionAmount);

      // Update rating
      await userRating.update(
        { averageRating: newRating },
        { transaction: t }
      );

      // Update report
      await report.update(
        {
          status: 'pending',
          isValid: null,
          approvedBy: null,
          approvedAt: null,
          pointsDeducted: 0,
          adminNotes: `Reversal: ${reason}`
        },
        { transaction: t }
      );

      // Create history entry
      await RatingHistory.create(
        {
          userId: report.reportedUserId,
          previousRating,
          newRating,
          changedBy: adminId,
          reason: 'report_invalid_reversed',
          sourceId: reportId,
          sourceType: 'report',
          adminNotes: `Report confirmation reversed. Reason: ${reason}`
        },
        { transaction: t }
      );

      await t.commit();

      return {
        success: true,
        report: await Report.findByPk(reportId, {
          include: [
            { model: (sequelize as any).models.User, as: 'reporter' },
            { model: (sequelize as any).models.User, as: 'reportedUser' }
          ]
        }),
        ratingRestored: {
          previousRating,
          newRating
        }
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error: any) {
    console.error('Error reversing report confirmation:', error);
    throw error;
  }
};
