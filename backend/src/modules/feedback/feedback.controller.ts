import { Request, Response } from 'express';
import { sequelize } from '../../models';
import { logFeedbackSubmitted } from '../../utils/systemLogger';

// Constants
const FEEDBACK_WINDOW_MIN_HOURS = 1; // Feedback opens 1 hour after materials_accepted
const FEEDBACK_WINDOW_MAX_DAYS = 7; // Feedback closes 7 days after materials_accepted
const MIN_COMMENT_LENGTH_FOR_LOW_RATING = 20; // Comments required for ratings < 3

const calculateFeedbackWindow = (materialsAcceptedAt: Date) => {
  const opensAt = new Date(materialsAcceptedAt);
  opensAt.setHours(opensAt.getHours() + FEEDBACK_WINDOW_MIN_HOURS);

  const closesAt = new Date(materialsAcceptedAt);
  closesAt.setDate(closesAt.getDate() + FEEDBACK_WINDOW_MAX_DAYS);

  const now = new Date();
  const isOpen = now >= opensAt && now < closesAt;
  const hoursRemaining = Math.max(0, (closesAt.getTime() - now.getTime()) / (1000 * 60 * 60));

  return { opensAt, closesAt, isOpen, hoursRemaining };
};

export const getCollectionFeedbackStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const collectionId = parseInt(req.params.collectionId, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const Feedback = (sequelize as any).models.Feedback;
    const Collection = (sequelize as any).models.Collection;
    const User = (sequelize as any).models.User;

    const collection = await Collection.findByPk(collectionId, {
      include: [
        { model: User, as: 'business', attributes: ['id', 'businessName', 'companyName'] },
        { model: User, as: 'recycler', attributes: ['id', 'businessName', 'companyName'] }
      ]
    });

    if (!collection) {
      return res.status(404).json({
        message: 'Collection not found',
        status: 'collection_not_found',
        canSubmit: false
      });
    }

    // Check if collection is completed (pickup_confirmed or materials_accepted)
    if (collection.status !== 'pickup_confirmed' && collection.status !== 'materials_accepted') {
      return res.status(200).json({
        message: 'Collection not yet ready for feedback',
        collectionId,
        status: 'not_completed',
        collectionStatus: collection.status,
        canSubmit: false,
        reason: `Collection must be in pickup_confirmed or materials_accepted status. Current status: ${collection.status}`
      });
    }

    // Get both parties' feedback
    const userFeedback = await Feedback.findOne({
      where: { collectionId, fromUserId: userId },
      include: [{ model: User, as: 'fromUser', attributes: ['id', 'businessName', 'companyName'] }]
    });

    const otherUserId = collection.businessId === userId ? collection.recyclerId : collection.businessId;
    const otherPartyFeedback = await Feedback.findOne({
      where: { collectionId, fromUserId: otherUserId },
      include: [{ model: User, as: 'fromUser', attributes: ['id', 'businessName', 'companyName', 'email'] }]
    });

    // Calculate feedback window based on when materials were accepted
    // For now, use updatedAt as proxy for completion time
    const feedbackWindow = calculateFeedbackWindow(collection.updatedAt);

    // Determine status
    let status = 'feedback_allowed';
    let reason = '';

    if (userFeedback) {
      status = 'already_submitted';
    } else if (!feedbackWindow.isOpen) {
      if (new Date() < feedbackWindow.opensAt) {
        status = 'window_not_opened';
        reason = `Feedback window opens in ${Math.ceil((feedbackWindow.opensAt.getTime() - new Date().getTime()) / (1000 * 60))} minutes`;
      } else {
        status = 'outside_window';
        reason = 'Feedback window has closed';
      }
    }

    res.status(200).json({
      message: 'Feedback status retrieved successfully',
      collectionId,
      status,
      reason,
      canSubmit: status === 'feedback_allowed',
      window: {
        opensAt: feedbackWindow.opensAt,
        closesAt: feedbackWindow.closesAt,
        isOpen: feedbackWindow.isOpen,
        hoursRemaining: feedbackWindow.hoursRemaining,
        minutesRemaining: Math.ceil((feedbackWindow.closesAt.getTime() - new Date().getTime()) / (1000 * 60))
      },
      yourFeedback: userFeedback ? {
        id: userFeedback.id,
        rating: userFeedback.rating,
        comment: userFeedback.comment,
        type: userFeedback.type,
        createdAt: userFeedback.createdAt
      } : null,
      otherPartyFeedback: otherPartyFeedback ? {
        id: otherPartyFeedback.id,
        rating: otherPartyFeedback.rating,
        comment: otherPartyFeedback.comment,
        type: otherPartyFeedback.type,
        createdAt: otherPartyFeedback.createdAt,
        fromUser: {
          id: otherPartyFeedback.fromUser.id,
          name: otherPartyFeedback.fromUser.businessName || otherPartyFeedback.fromUser.companyName,
          email: otherPartyFeedback.fromUser.email
        }
      } : null,
      otherPartyName: otherUserId === collection.businessId 
        ? (collection.business?.businessName || collection.business?.companyName)
        : (collection.recycler?.businessName || collection.recycler?.companyName)
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving feedback status', error: error.message });
  }
};

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

    // Validate comment requirement for low ratings
    const trimmedComment = comment ? String(comment).trim() : '';
    if (rating < 3 && trimmedComment.length < MIN_COMMENT_LENGTH_FOR_LOW_RATING) {
      return res.status(400).json({
        message: `For ratings below 3 stars, a comment of at least ${MIN_COMMENT_LENGTH_FOR_LOW_RATING} characters is required. Current: ${trimmedComment.length} characters.`,
        minimumCommentLength: MIN_COMMENT_LENGTH_FOR_LOW_RATING
      });
    }

    const Feedback = (sequelize as any).models.Feedback;
    const Collection = (sequelize as any).models.Collection;
    const UserRating = (sequelize as any).models.UserRating;
    const User = (sequelize as any).models.User;
    const Notification = (sequelize as any).models.Notification;

    const collection = await Collection.findByPk(collectionId);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.status !== 'pickup_confirmed' && collection.status !== 'materials_accepted') {
      return res.status(400).json({ message: 'Can only submit feedback for completed collections' });
    }

    // Check feedback window
    const feedbackWindow = calculateFeedbackWindow(collection.updatedAt);
    if (!feedbackWindow.isOpen) {
      return res.status(400).json({
        message: 'Feedback window is not open',
        reason: feedbackWindow.opensAt > new Date() 
          ? 'Feedback window not yet opened'
          : 'Feedback window has closed',
        window: feedbackWindow
      });
    }

    const existingFeedback = await Feedback.findOne({
      where: { collectionId, fromUserId }
    });

    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already submitted feedback for this collection' });
    }

    let feedbackType: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (rating >= 4) feedbackType = 'positive';
    if (rating <= 2) feedbackType = 'negative';

    const feedback = await Feedback.create({
      collectionId,
      fromUserId,
      toUserId,
      rating,
      comment: trimmedComment || null,
      type: feedbackType
    });

    let userRating = await UserRating.findOne({ where: { userId: toUserId } });

    if (!userRating) {
      userRating = await UserRating.create({
        userId: toUserId,
        averageRating: rating,
        totalRatings: 1,
        totalFeedback: trimmedComment ? 1 : 0
      });
    } else {
      const newTotal = userRating.totalRatings + 1;
      userRating.averageRating = (userRating.averageRating * userRating.totalRatings + rating) / newTotal;
      userRating.totalRatings = newTotal;
      if (trimmedComment) userRating.totalFeedback += 1;
      await userRating.save();
    }

    // Get sender info for notification
    const fromUser = await User.findByPk(fromUserId, {
      attributes: ['id', 'businessName', 'companyName']
    });

    // Create notification for recipient
    await Notification.create({
      userId: toUserId,
      type: 'FEEDBACK_RECEIVED',
      title: 'Feedback Received',
      message: `${fromUser?.businessName || fromUser?.companyName || 'A user'} left you ${rating}-star feedback on a collection.`,
      relatedId: feedback.id,
      read: false
    });

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
