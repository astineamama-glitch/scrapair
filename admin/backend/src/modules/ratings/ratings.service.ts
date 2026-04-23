/**
 * Ratings Service
 * Handles business logic for rating management
 */

import { sequelize } from '../../shared/db/index';
import { Op } from 'sequelize';

/**
 * Manually adjust user rating (admin override)
 */
export const manuallyAdjustRating = async (
  userId: number,
  adminId: number,
  newRating: number,
  adminNotes: string
) => {
  try {
    const UserRating = (sequelize as any).models.UserRating;
    const RatingHistory = (sequelize as any).models.RatingHistory;

    // Validate rating
    if (newRating < 1.0 || newRating > 5.0) {
      throw new Error('Rating must be between 1.0 and 5.0');
    }

    const t = await sequelize.transaction();

    try {
      // Get user rating
      let userRating = await UserRating.findOne(
        { where: { userId }, transaction: t },
        { lock: t.LOCK.UPDATE }
      );

      if (!userRating) {
        userRating = await UserRating.create(
          { userId, averageRating: 5.0, totalRatings: 0, totalFeedback: 0 },
          { transaction: t }
        );
      }

      const previousRating = userRating.averageRating;

      // Update rating
      await userRating.update(
        { averageRating: newRating },
        { transaction: t }
      );

      // Create history entry
      await RatingHistory.create(
        {
          userId,
          previousRating,
          newRating,
          changedBy: adminId,
          reason: 'manual_admin_adjustment',
          sourceType: 'admin',
          adminNotes
        },
        { transaction: t }
      );

      await t.commit();

      return {
        success: true,
        userRating: await UserRating.findOne({ where: { userId } }),
        adjustment: {
          previousRating,
          newRating,
          difference: newRating - previousRating
        }
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error: any) {
    console.error('Error manually adjusting rating:', error);
    throw error;
  }
};

/**
 * Recalculate user rating based on reports and feedback
 * This should be called periodically or on-demand
 */
export const recalculateUserRating = async (userId: number) => {
  try {
    const Report = (sequelize as any).models.Report;
    const Feedback = (sequelize as any).models.Feedback;
    const UserRating = (sequelize as any).models.UserRating;

    // Start with default rating
    let calculatedRating = 5.0;

    // Get all valid reports against this user
    const validReports = await Report.findAll({
      where: {
        reportedUserId: userId,
        status: 'valid_confirmed'
      }
    });

    // Calculate total deduction from reports
    let totalReportDeduction = 0;
    validReports.forEach((report: any) => {
      totalReportDeduction += report.pointsDeducted || 0;
    });

    // Apply report deductions
    calculatedRating -= totalReportDeduction;

    // Get feedback ratings for this user (as recipient)
    const feedbackData = await Feedback.findAll({
      where: { toUserId: userId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      raw: true
    });

    // Apply feedback impact (if average feedback is low, it can affect rating)
    if (feedbackData.length > 0) {
      const avgFeedback = parseFloat(feedbackData[0]?.avgRating || '5.0') || 5.0;
      const feedbackCount = parseInt(feedbackData[0]?.count || '0') || 0;

      // If feedback is below 3.0 and there are multiple feedbacks, apply a small deduction
      if (avgFeedback < 3.0 && feedbackCount >= 3) {
        const feedbackDeduction = (5.0 - avgFeedback) * 0.1; // Max 0.2 deduction
        calculatedRating -= feedbackDeduction;
      }
    }

    // Ensure rating is within bounds
    calculatedRating = Math.max(1.0, Math.min(5.0, calculatedRating));
    calculatedRating = Math.round(calculatedRating * 100) / 100;

    // Update user rating
    let userRating = await UserRating.findOne({ where: { userId } });
    if (!userRating) {
      userRating = await UserRating.create({ userId, averageRating: calculatedRating });
    } else {
      const previousRating = userRating.averageRating;
      if (Math.abs(previousRating - calculatedRating) > 0.01) {
        // Only create history if there's a significant change
        const RatingHistory = (sequelize as any).models.RatingHistory;
        await RatingHistory.create({
          userId,
          previousRating,
          newRating: calculatedRating,
          reason: 'system_recalculation',
          sourceType: 'admin',
          adminNotes: `System recalculation: Reports=${totalReportDeduction}, Feedback impact calculated`
        });

        await userRating.update({ averageRating: calculatedRating });
      }
    }

    return {
      success: true,
      userRating,
      breakdown: {
        baseRating: 5.0,
        reportDeductions: totalReportDeduction,
        finalRating: calculatedRating,
        validReportsCount: validReports.length
      }
    };
  } catch (error: any) {
    console.error('Error recalculating user rating:', error);
    throw error;
  }
};

/**
 * Get rating history for a user
 */
export const getRatingHistory = async (userId: number, limit: number = 50, offset: number = 0) => {
  try {
    const RatingHistory = (sequelize as any).models.RatingHistory;
    const User = (sequelize as any).models.User;
    const AdminUser = (sequelize as any).models.AdminUser;

    const { count, rows } = await RatingHistory.findAndCountAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName']
        },
        {
          model: AdminUser,
          as: 'admin',
          attributes: ['id', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      success: true,
      data: rows,
      pagination: {
        total: count,
        limit,
        offset,
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error: any) {
    console.error('Error getting rating history:', error);
    throw error;
  }
};

/**
 * Get rating statistics for a user
 */
export const getRatingStats = async (userId: number) => {
  try {
    const Report = (sequelize as any).models.Report;
    const Feedback = (sequelize as any).models.Feedback;
    const UserRating = (sequelize as any).models.UserRating;
    const RatingHistory = (sequelize as any).models.RatingHistory;

    // Get user rating
    const userRating = await UserRating.findOne({ where: { userId } });

    // Count valid reports
    const validReportCount = await Report.count({
      where: { reportedUserId: userId, status: 'valid_confirmed' }
    });

    // Count pending reports
    const pendingReportCount = await Report.count({
      where: { reportedUserId: userId, status: 'pending' }
    });

    // Count invalid reports
    const invalidReportCount = await Report.count({
      where: { reportedUserId: userId, status: 'invalid_confirmed' }
    });

    // Get feedback count
    const feedbackCount = await Feedback.count({ where: { toUserId: userId } });

    // Get rating changes count (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentChanges = await RatingHistory.count({
      where: { userId, createdAt: { [Op.gte]: thirtyDaysAgo } }
    });

    return {
      success: true,
      stats: {
        currentRating: userRating?.averageRating || 5.0,
        reports: {
          valid: validReportCount,
          pending: pendingReportCount,
          invalid: invalidReportCount,
          total: validReportCount + pendingReportCount + invalidReportCount
        },
        feedback: {
          total: feedbackCount
        },
        ratingChanges: {
          last30Days: recentChanges
        }
      }
    };
  } catch (error: any) {
    console.error('Error getting rating stats:', error);
    throw error;
  }
};
