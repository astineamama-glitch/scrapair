/**
 * Rating Maintenance Controller
 * Admin endpoints for rating maintenance and recalculation
 */

import { Request, Response } from 'express';
import { sequelize } from '../../shared/db/index';

const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Recalculate all user ratings based on feedback
 */
export const recalculateAllUserRatings = async (req: Request, res: Response): Promise<any> => {
  try {
    const adminId = (req as any).admin?.id;
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized - Admin ID required' });
    }

    const UserRating = (sequelize as any).models.UserRating;
    const Feedback = (sequelize as any).models.Feedback;

    // Get all feedback aggregated by toUserId
    const feedbackStats = await sequelize.query(`
      SELECT 
        "toUserId",
        COUNT(*) as "totalCount",
        AVG("rating") as "avgRating",
        COUNT(CASE WHEN "comment" IS NOT NULL AND TRIM("comment") != '' THEN 1 END) as "withComments"
      FROM "feedbacks"
      GROUP BY "toUserId"
      ORDER BY "totalCount" DESC
    `, { type: 'SELECT' });

    const updates = [];
    const t = await sequelize.transaction();

    try {
      for (const stat of feedbackStats as any[]) {
        const avgRating = Math.round(parseFloat(stat.avgRating) * 100) / 100;

        await UserRating.update(
          {
            totalRatings: parseInt(stat.totalCount),
            averageRating: avgRating,
            updatedAt: new Date()
          },
          {
            where: { userId: stat.toUserId },
            transaction: t
          }
        );

        updates.push({
          userId: stat.toUserId,
          totalRatings: parseInt(stat.totalCount),
          averageRating: avgRating,
          withComments: parseInt(stat.withComments)
        });
      }

      await t.commit();

      res.status(200).json({
        message: 'User ratings recalculated successfully',
        totalUpdated: updates.length,
        updates,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error: any) {
    console.error('Error recalculating user ratings:', error);
    res.status(500).json({
      message: 'Error recalculating ratings',
      error: NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get rating recalculation report
 */
export const getRatingRecalculationReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const adminId = (req as any).admin?.id;
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized - Admin ID required' });
    }

    // Get current state
    const currentRatings = await sequelize.query(`
      SELECT 
        ur."userId",
        ur."averageRating",
        ur."totalRatings",
        ur."totalFeedback",
        COUNT(f.id) as "actualFeedbackCount",
        AVG(f."rating") as "calculatedAverage"
      FROM "user_ratings" ur
      LEFT JOIN "feedbacks" f ON ur."userId" = f."toUserId"
      GROUP BY ur."userId", ur."averageRating", ur."totalRatings", ur."totalFeedback"
      ORDER BY ur."userId"
    `, { type: 'SELECT' });

    const discrepancies = (currentRatings as any[]).filter(
      r => parseInt(r.actualFeedbackCount) !== parseInt(r.totalRatings)
    );

    res.status(200).json({
      message: 'Rating recalculation report',
      summary: {
        totalUsers: currentRatings.length,
        usersWithDiscrepancies: discrepancies.length,
        discrepancyPercentage: ((discrepancies.length / currentRatings.length) * 100).toFixed(2) + '%'
      },
      discrepancies: discrepancies.slice(0, 20), // Show first 20
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({
      message: 'Error generating report',
      error: NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export default { recalculateAllUserRatings, getRatingRecalculationReport };
