import { Sequelize, Op } from 'sequelize';

export interface DeleteResult {
  success: boolean;
  deletedUserId: number;
  deletedCount: {
    user: number;
    wastePosts: number;
    collections: number;
    messages: number;
    conversations: number;
    notifications: number;
    reviews: number;
    ratings: number;
    feedback: number;
    postMessages: number;
    reports: number;
    systemLogs: number;
  };
  message: string;
}
export const deleteUserWithCascade = async (
  userId: number,
  userType: 'business' | 'recycler',
  sequelizeInstance: Sequelize
): Promise<DeleteResult> => {
  const transaction = await sequelizeInstance.transaction();

  try {
    const deletedCount = {
      user: 0,
      wastePosts: 0,
      collections: 0,
      messages: 0,
      conversations: 0,
      notifications: 0,
      reviews: 0,
      ratings: 0,
      feedback: 0,
      postMessages: 0,
      reports: 0,
      systemLogs: 0
    };

    const models = (sequelizeInstance as any).models;
    const User = models.User;
    const WastePost = models.WastePost;
    const Collection = models.Collection;
    const Message = models.Message;
    const Conversation = models.Conversation;
    const Notification = models.Notification;
    const Review = models.Review;
    const UserRating = models.UserRating;
    const Feedback = models.Feedback;
    const PostMessage = models.PostMessage;
    const Report = models.Report;
    const SystemLog = models.SystemLog;
    const PasswordAudit = models.PasswordAudit;
    const Material = models.Material;
    const PostRating = models.PostRating;

    // Step 1: Delete all user ratings
    if (UserRating) {
      const ratingsDeleted = await UserRating.destroy({
        where: { userId: userId },
        transaction
      });
      deletedCount.ratings += ratingsDeleted;
    }

    // Step 2: Delete all reviews
    if (Review) {
      const reviewsDeleted = await Review.destroy({
        where: {
          [Op.or]: [
            { reviewerId: userId },
            { businessId: userId }
          ]
        },
        transaction
      });
      deletedCount.reviews += reviewsDeleted;
    }

    // Step 3: Delete all feedback
    if (Feedback) {
      const feedbackDeleted = await Feedback.destroy({
        where: {
          [Op.or]: [{ fromUserId: userId }, { toUserId: userId }]
        },
        transaction
      });
      deletedCount.feedback += feedbackDeleted;
    }

    // Step 4: Delete all reports
    if (Report) {
      const reportsDeleted = await Report.destroy({
        where: {
          [Op.or]: [
            { reporterId: userId },
            { reportedUserId: userId },
            { approvedBy: userId }
          ]
        },
        transaction
      });
      deletedCount.reports += reportsDeleted;
    }

    // Step 5: Delete all post messages
    if (PostMessage) {
      const postMessagesDeleted = await PostMessage.destroy({
        where: {
          [Op.or]: [
            { senderId: userId },
            { recipientId: userId }
          ]
        },
        transaction
      });
      deletedCount.postMessages += postMessagesDeleted;
    }

    // Step 6: Delete all system logs
    if (SystemLog) {
      const systemLogsDeleted = await SystemLog.destroy({
        where: { userId: userId },
        transaction
      });
      deletedCount.systemLogs += systemLogsDeleted;
    }

    // Step 7: Delete password audit logs
    if (PasswordAudit) {
      await PasswordAudit.destroy({
        where: { userId: userId },
        transaction
      });
    }

    // Step 8: Delete all notifications
    if (Notification) {
      const notificationsDeleted = await Notification.destroy({
        where: { userId: userId },
        transaction
      });
      deletedCount.notifications += notificationsDeleted;
    }

    // Step 9: Delete all messages
    if (Message) {
      const messagesDeleted = await Message.destroy({
        where: {
          [Op.or]: [
            { senderId: userId },
            { recipientId: userId }
          ]
        },
        transaction
      });
      deletedCount.messages += messagesDeleted;
    }

    // Step 10: Delete conversations
    if (Conversation) {
      const conversationsDeleted = await Conversation.destroy({
        where: {
          [Op.or]: [
            { participant1Id: userId },
            { participant2Id: userId }
          ]
        },
        transaction
      });
      deletedCount.conversations += conversationsDeleted;
    }

    // Step 11: Delete all collections involving this user (regardless of status)
    if (userType === 'business') {
      // First, get all waste post IDs for this business
      const wastePostIds = await WastePost.findAll({
        where: { businessId: userId },
        attributes: ['id'],
        transaction,
        raw: true
      });

      if (wastePostIds && wastePostIds.length > 0) {
        const postIds = wastePostIds.map((p: any) => p.id);
        
        // Delete collections where this business posted the waste
        const collectionsForPostsDeleted = await Collection.destroy({
          where: { postId: postIds },
          transaction
        });
        deletedCount.collections += collectionsForPostsDeleted;
      }

      // Delete collections where this business is the collector
      const collectionsAsCollectorDeleted = await Collection.destroy({
        where: { businessId: userId },
        transaction
      });
      deletedCount.collections += collectionsAsCollectorDeleted;
    } else {
      // For recycler: delete collections where they are the collector
      const collectionsDeleted = await Collection.destroy({
        where: { recyclerId: userId },
        transaction
      });
      deletedCount.collections += collectionsDeleted;
    }

    // Step 12: Delete all Material posts (business only)
    if (userType === 'business' && Material) {
      const materialsDeleted = await Material.destroy({
        where: { businessUserId: userId },
        transaction
      });
      deletedCount.postMessages += materialsDeleted; // Reuse field for material count
    }

    // Step 13: Delete post ratings before waste posts
    if (PostRating) {
      // Get all waste post IDs for this user
      const allUserPostIds = await WastePost.findAll({
        where: { businessId: userId },
        attributes: ['id'],
        transaction,
        raw: true
      });

      if (allUserPostIds && allUserPostIds.length > 0) {
        const postIds = allUserPostIds.map((p: any) => p.id);
        await PostRating.destroy({
          where: { postId: postIds },
          transaction
        });
      }
    }

    // Step 14: Clear approvedRecyclerId from waste posts (don't delete the posts)
    // For recyclers: clear posts where they were approved
    // For businesses: clear posts where they were approved as recycler
    if (WastePost) {
      await WastePost.update(
        { approvedRecyclerId: null },
        { where: { approvedRecyclerId: userId }, transaction }
      );
    }

    // Step 15: Delete all waste posts (business only)
    if (userType === 'business') {
      const postsDeleted = await WastePost.destroy({
        where: { businessId: userId },
        transaction
      });
      deletedCount.wastePosts += postsDeleted;
    }

    // Step 16: Delete the user
    const userDeleted = await User.destroy({
      where: { id: userId },
      transaction
    });
    deletedCount.user = userDeleted;

    await transaction.commit();

    return {
      success: true,
      deletedUserId: userId,
      deletedCount,
      message: `User and all related data deleted successfully. Deleted: ${deletedCount.user} user, ${deletedCount.wastePosts} posts, ${deletedCount.collections} collections, ${deletedCount.messages} messages, ${deletedCount.conversations} conversations, ${deletedCount.notifications} notifications, ${deletedCount.reviews} reviews, ${deletedCount.ratings} ratings, ${deletedCount.feedback} feedback entries.`
    };
  } catch (error: any) {
    await transaction.rollback();
    throw {
      success: false,
      message: `Failed to delete user: ${error.message}`,
      error: error
    };
  }
};

