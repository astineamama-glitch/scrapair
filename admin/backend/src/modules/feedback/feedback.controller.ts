/**
 * Feedback Controller
 * Admin backend feedback management
 */

import { Request, Response } from 'express';
import { sequelize } from '../../shared/db/index';
import {
  FeedbackResponse,
  FeedbackStatsResponse,
  RatingDistribution,
  TypeBreakdown,
  FeedbackStats
} from './feedback.types';

const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Get all feedback with filters and pagination
 */
export const getAllFeedback = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20, rating, type, fromUserType, toUserType, startDate, endDate } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const Feedback = (sequelize as any).models.Feedback;
    const User = (sequelize as any).models.User;
    const Collection = (sequelize as any).models.Collection;

    // Build where clause
    const where: any = {};

    if (rating) {
      const ratingNum = parseInt(rating as string);
      if (ratingNum >= 1 && ratingNum <= 5) {
        where.rating = ratingNum;
      }
    }

    if (type && ['positive', 'negative', 'neutral'].includes(type as string)) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.$lte = end;
      }
    }

    // Build include with filters
    const include: any[] = [
      {
        model: User,
        as: 'fromUser',
        attributes: ['id', 'email', 'type', 'businessName', 'companyName'],
        required: !!fromUserType
      },
      {
        model: User,
        as: 'toUser',
        attributes: ['id', 'email', 'type', 'businessName', 'companyName'],
        required: !!toUserType
      },
      {
        model: Collection,
        as: 'collection',
        attributes: ['id', 'status', 'requestDate', 'completedAt'],
        required: false
      }
    ];

    // Add where clause for user type filtering
    if (fromUserType) {
      include[0].where = { type: fromUserType };
    }
    if (toUserType) {
      include[1].where = { type: toUserType };
    }

    // Fetch feedback
    const { count, rows } = await Feedback.findAndCountAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
      distinct: true
    });

    const response: FeedbackResponse = {
      message: 'Feedback retrieved successfully',
      data: rows as any[],
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(count / limitNum)
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      message: 'Error fetching feedback',
      error: NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get feedback statistics
 */
export const getFeedbackStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const Feedback = (sequelize as any).models.Feedback;

    // Get total count
    const totalCount = await Feedback.count();

    // Get average rating
    const avgResult = await Feedback.findAll({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
      ],
      raw: true
    });

    const averageRating = parseFloat(avgResult[0]?.avgRating || '0') || 0;

    // Get rating distribution
    const ratingDistResult = await Feedback.findAll({
      attributes: [
        'rating',
        [sequelize.literal('COUNT(*)'), 'count']
      ],
      group: ['rating'],
      raw: true,
      subQuery: false
    });

    const ratingDistribution: RatingDistribution = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0
    };

    ratingDistResult.forEach((row: any) => {
      const rating = Math.round(row.rating);
      if (rating >= 1 && rating <= 5) {
        const ratingKey = rating.toString() as keyof RatingDistribution;
        const countValue = row.count || (Object.keys(row).length > 1 ? Object.values(row).find((v, i) => i > 0 && typeof v === 'number') : 0);
        ratingDistribution[ratingKey] = parseInt(String(countValue || 0));
      }
    });

    // Get type breakdown
    const typeResult = await Feedback.findAll({
      attributes: [
        'type',
        [sequelize.literal('COUNT(*)'), 'count']
      ],
      group: ['type'],
      raw: true,
      subQuery: false
    });

    const typeBreakdown: TypeBreakdown = {
      positive: 0,
      negative: 0,
      neutral: 0
    };

    typeResult.forEach((row: any) => {
      if (row.type && row.type in typeBreakdown) {
        const countValue = row.count || (Object.keys(row).length > 1 ? Object.values(row).find((v, i) => i > 0 && typeof v === 'number') : 0);
        typeBreakdown[row.type as keyof TypeBreakdown] = parseInt(String(countValue || 0));
      }
    });

    const stats: FeedbackStats = {
      totalFeedback: totalCount,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      typeBreakdown
    };

    const response: FeedbackStatsResponse = {
      message: 'Feedback statistics retrieved successfully',
      data: stats
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      message: 'Error fetching feedback statistics',
      error: NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export default { getAllFeedback, getFeedbackStats };
