import { Request, Response } from 'express';
import { sequelize } from '../../shared/db/index';

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

export { getAllUserRatings, getAllPostRatings };
