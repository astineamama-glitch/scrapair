import { Request, Response } from 'express';
import { sequelize } from '../../models';

export const getPostRating = async (req: Request, res: Response): Promise<any> => {
  try {
    const { postId } = req.params;

    const PostRating = (sequelize as any).models.PostRating;
    const WastePost = (sequelize as any).models.WastePost;
    const Feedback = (sequelize as any).models.Feedback;
    const Collection = (sequelize as any).models.Collection;

    let postRating = await PostRating.findOne({ where: { postId } });

    if (!postRating) {
      postRating = await PostRating.create({
        postId,
        averageRating: 5.0,
        totalRatings: 0,
        totalFeedback: 0
      });
    }

    const collections = await Collection.findAll({
      where: { postId },
      attributes: ['id']
    });

    const collectionIds = collections.map((c: any) => c.id);
    const feedbacks = await Feedback.findAll({
      where: { collectionId: collectionIds },
      include: [
        {
          model: (sequelize as any).models.User,
          as: 'fromUser',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName']
        }
      ],
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Post rating retrieved successfully',
      data: {
        postId,
        averageRating: postRating.averageRating,
        totalRatings: postRating.totalRatings,
        totalFeedback: postRating.totalFeedback,
        recentFeedback: feedbacks
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching post rating', error: error.message });
  }
};

export const getUserRating = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;

    const UserRating = (sequelize as any).models.UserRating;
    const User = (sequelize as any).models.User;
    const Feedback = (sequelize as any).models.Feedback;
    const Report = (sequelize as any).models.Report;

    let userRating = await UserRating.findOne({ where: { userId } });

    if (!userRating) {
      userRating = await UserRating.create({
        userId,
        averageRating: 5.0,
        totalRatings: 0,
        totalFeedback: 0
      });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'type', 'businessName', 'companyName', 'isActive']
    });

    const recentFeedbacks = await Feedback.findAll({
      where: { toUserId: userId },
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName']
        }
      ],
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    const reportCount = await Report.count({
      where: { reportedUserId: userId, status: 'valid_confirmed' }
    });

    res.status(200).json({
      message: 'User rating retrieved successfully',
      data: {
        averageRating: userRating.averageRating,
        totalRatings: userRating.totalRatings,
        totalFeedback: userRating.totalFeedback,
        reportCount: reportCount,
        user,
        recentFeedback: recentFeedbacks
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user rating', error: error.message });
  }
};

export const getAllUserRatings = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20, sortBy = 'averageRating' } = req.query;
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
      order: [[sortBy as string, 'DESC']],
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
    res.status(500).json({ message: 'Error fetching user ratings', error: error.message });
  }
};

export const getAllPostRatings = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20, sortBy = 'averageRating' } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const PostRating = (sequelize as any).models.PostRating;
    const WastePost = (sequelize as any).models.WastePost;

    const { count, rows } = await PostRating.findAndCountAll({
      include: [
        {
          model: WastePost,
          as: 'post',
          attributes: ['id', 'title', 'wasteType', 'status', 'businessId']
        }
      ],
      order: [[sortBy as string, 'DESC']],
      limit: limit as number,
      offset
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
    res.status(500).json({ message: 'Error fetching post ratings', error: error.message });
  }
};
