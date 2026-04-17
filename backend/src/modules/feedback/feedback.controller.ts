import { Request, Response } from 'express';
import { sequelize } from '../../models';
import { logFeedbackSubmitted } from '../../utils/systemLogger';

export const submitFeedback = async (req: Request, res: Response): Promise<any> => {
  try {
    const { collectionId, toUserId, rating, comment } = req.body;
    const fromUserId = req.user?.id;

    if (!collectionId || !toUserId || !rating) {
      return res.status(400).json({ message: 'Missing required fields: collectionId, toUserId, rating' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const Feedback = (sequelize as any).models.Feedback;
    const Collection = (sequelize as any).models.Collection;
    const UserRating = (sequelize as any).models.UserRating;

    const collection = await Collection.findByPk(collectionId);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.status !== 'completed' && collection.status !== 'confirmed') {
      return res.status(400).json({ message: 'Can only submit feedback for completed collections' });
    }

    const existingFeedback = await Feedback.findOne({
      where: { collectionId, fromUserId }
    });

    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this collection' });
    }

    let feedbackType: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (rating >= 4) feedbackType = 'positive';
    if (rating <= 2) feedbackType = 'negative';

    const feedback = await Feedback.create({
      collectionId,
      fromUserId,
      toUserId,
      rating,
      comment: comment || null,
      type: feedbackType
    });

    let userRating = await UserRating.findOne({ where: { userId: toUserId } });
    
    if (!userRating) {
      userRating = await UserRating.create({
        userId: toUserId,
        averageRating: rating,
        totalRatings: 1,
        totalFeedback: comment ? 1 : 0
      });
    } else {
      const newTotal = userRating.totalRatings + 1;
      userRating.averageRating = (userRating.averageRating * userRating.totalRatings + rating) / newTotal;
      userRating.totalRatings = newTotal;
      if (comment) userRating.totalFeedback += 1;
      await userRating.save();
    }

    await logFeedbackSubmitted(fromUserId !, feedback.id, req);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      data: {
        feedback,
        userRating: {
          averageRating: userRating.averageRating,
          totalRatings: userRating.totalRatings
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
};

export const getUserFeedback = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const Feedback = (sequelize as any).models.Feedback;
    const User = (sequelize as any).models.User;

    const { count, rows } = await Feedback.findAndCountAll({
      where: { toUserId: userId },
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName'],
          required: false
        },
        {
          model: User,
          as: 'toUser',
          attributes: ['id', 'email', 'type'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit as number,
      offset
    });

    res.status(200).json({
      message: 'User feedback retrieved successfully',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / (limit as number))
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user feedback', error: error.message });
  }
};

export const getPostFeedback = async (req: Request, res: Response): Promise<any> => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const Feedback = (sequelize as any).models.Feedback;
    const Collection = (sequelize as any).models.Collection;
    const User = (sequelize as any).models.User;

    const collections = await Collection.findAll({
      where: { postId },
      attributes: ['id']
    });

    const collectionIds = collections.map((c: any) => c.id);

    if (collectionIds.length === 0) {
      return res.status(200).json({
        message: 'No feedback found for this post',
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0
        }
      });
    }

    const { count, rows } = await Feedback.findAndCountAll({
      where: { collectionId: collectionIds },
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit as number,
      offset
    });

    res.status(200).json({
      message: 'Post feedback retrieved successfully',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / (limit as number))
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching post feedback', error: error.message });
  }
};
