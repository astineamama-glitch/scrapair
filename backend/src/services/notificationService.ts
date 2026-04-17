import { Notification } from '../models';
import type { NotificationInstance } from '../models';

export interface NotificationData {
  userId: number;
  type: 'MESSAGE' | 'COLLECTION_REQUEST' | 'INQUIRY' | 'VERIFICATION' | 'MATERIAL_POSTED' | 'WASTE_POST_CREATED';
  title: string;
  message: string;
  relatedId?: number;
}

export class NotificationService {
  static async createNotification(data: NotificationData): Promise<NotificationInstance> {
    try {
      const notification = await Notification.create({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedId: data.relatedId,
        read: false
      });
      return notification;
    } catch (error) {
      throw error;
    }
  }
  static async createBulkNotifications(
    userIds: number[],
    data: Omit<NotificationData, 'userId'>
  ): Promise<NotificationInstance[]> {
    try {
      const notifications = await Promise.all(
        userIds.map(userId =>
          Notification.create({
            userId,
            type: data.type,
            title: data.title,
            message: data.message,
            relatedId: data.relatedId,
            read: false
          })
        )
      );


      return notifications;
    } catch (error) {
      throw error;
    }
  }
  static async notifyUserVerified(userId: number): Promise<NotificationInstance> {
    return this.createNotification({
      userId,
      type: 'VERIFICATION',
      title: 'Account Verified',
      message: 'Your account has been verified by the admin. You can now post materials and waste.'
    });
  }
  static async notifyUserUnverified(userId: number): Promise<NotificationInstance> {
    return this.createNotification({
      userId,
      type: 'VERIFICATION',
      title: 'Account Unverified',
      message: 'Your account verification has been removed by the admin.'
    });
  }
  static async notifyMaterialPosted(
    businessUserId: number,
    materialId: number,
    materialType: string
  ): Promise<NotificationInstance> {
    return this.createNotification({
      userId: businessUserId,
      type: 'MATERIAL_POSTED',
      title: 'Material Posted Successfully',
      message: `Your ${materialType} material has been posted and is now available for recyclers to view.`,
      relatedId: materialId
    });
  }  static async notifyRecyclersNewMaterial(
    recyclerIds: number[],
    materialType: string
  ): Promise<NotificationInstance[]> {
    if (recyclerIds.length === 0) return [];

    return this.createBulkNotifications(recyclerIds, {
      type: 'MATERIAL_POSTED',
      title: `New ${materialType} Available`,
      message: `A business has posted new ${materialType} material. Check it out!`
    });
  }
  static async notifyCollectionRequest(
    targetUserId: number,
    requesterName: string,
    collectionId: number
  ): Promise<NotificationInstance> {
    return this.createNotification({
      userId: targetUserId,
      type: 'COLLECTION_REQUEST',
      title: 'New Collection Request',
      message: `${requesterName} has requested to collect materials from you.`,
      relatedId: collectionId
    });
  }
  static async notifyNewMessage(
    recipientId: number,
    senderName: string,
    messageId: number
  ): Promise<NotificationInstance> {
    return this.createNotification({
      userId: recipientId,
      type: 'MESSAGE',
      title: 'New Message',
      message: `You received a new message from ${senderName}.`,
      relatedId: messageId
    });
  }
  static async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<{ notifications: NotificationInstance[]; total: number }> {
    try {
      const where: any = { userId };
      if (unreadOnly) {
        where.read = false;
      }

      const notifications = await Notification.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: Math.min(limit, 100),
        offset: (page - 1) * limit
      });

      const total = await Notification.count({ where });

      return { notifications, total };
    } catch (error) {
      throw error;
    }
  }
  static async getUnreadCount(userId: number): Promise<number> {
    try {
      const count = await Notification.count({
        where: {
          userId,
          read: false
        }
      });
      return count;
    } catch (error) {
      throw error;
    }
  }
}

export default NotificationService;

