import { Request, Response } from 'express';
import { sequelize } from '../../shared/db/index';
import {
  manuallyAdjustRating,
  recalculateUserRating,
  getRatingHistory,
  getRatingStats
} from './ratings.service';

const NODE_ENV = process.env.NODE_ENV || 'development';

const getAllUserRatings = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const UserRating = (sequelize as any).models.UserRating;
    const User = (sequelize as any).models.User;

    const { count, rows } = await UserRating.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName', 'isActive']
        }
      ],
      order: [['averageRating', 'DESC']],
      limit: limit as number,
      offset
    });

    res.status(200).json({
      message: 'User ratings retrieved successfully',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / (limit as number))
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error fetching user ratings', 
      error: 'Failed to fetch user ratings',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const getAllPostRatings = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const PostRating = (sequelize as any).models.PostRating;

    const { count, rows } = await PostRating.findAndCountAll({
      order: [['averageRating', 'DESC']],
      limit: limit as number,
      offset,
      raw: true
    });

    res.status(200).json({
      message: 'Post ratings retrieved successfully',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / (limit as number))
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error fetching post ratings', 
      error: 'Failed to fetch post ratings',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

/**
 * Get rating history for a specific user
 */
const getUserRatingHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const result = await getRatingHistory(parseInt(userId), limit as number, offset);

    res.status(200).json({
      message: 'User rating history retrieved successfully',
      ...result
    });
  } catch (error: any) {
    console.error('Error fetching rating history:', error);
    res.status(500).json({
      message: 'Error fetching rating history',
      error: NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get rating statistics for a user
 */
const getUserRatingStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;

    const result = await getRatingStats(parseInt(userId));

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching rating stats:', error);
    res.status(500).json({
      message: 'Error fetching rating stats',
      error: NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Manually adjust user rating (admin override)
 */
const adjustUserRatingManually = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const { newRating, adminNotes } = req.body;
    const adminId = (req as any).user?.id;

    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized - Admin ID required' });
    }

    if (newRating === undefined || newRating === null) {
      return res.status(400).json({ message: 'newRating is required' });
    }

    if (!adminNotes || adminNotes.trim().length === 0) {
      return res.status(400).json({ message: 'Admin notes are required' });
    }

    const result = await manuallyAdjustRating(
      parseInt(userId),
      adminId,
      parseFloat(newRating),
      adminNotes
    );

    res.status(200).json({
      message: 'User rating adjusted successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error adjusting user rating:', error);
    res.status(500).json({
      message: 'Error adjusting user rating',
      error: NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Recalculate user rating based on reports and feedback
 */
const recalculateRating = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;

    const result = await recalculateUserRating(parseInt(userId));

    res.status(200).json({
      message: 'User rating recalculated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error recalculating rating:', error);
    res.status(500).json({
      message: 'Error recalculating rating',
      error: NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export {
  getAllUserRatings,
  getAllPostRatings,
  getUserRatingHistory,
  getUserRatingStats,
  adjustUserRatingManually,
  recalculateRating
};
