// Notification Module
import { Request, Response } from 'express';
import { sequelize } from '../../models';

export const getUserNotifications = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, read } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const Notification = (sequelize as any).models.Notification;
    const whereClause: any = { userId };
    if (read !== undefined) whereClause.read = read === 'true';

    const { count, rows } = await Notification.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Notifications retrieved',
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
      data: rows
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    const Notification = (sequelize as any).models.Notification;
    const notification = await Notification.findByPk(notificationId);

    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to mark notification' });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const Notification = (sequelize as any).models.Notification;

    await Notification.update(
      { read: true },
      {
        where: {
          userId,
          read: false
        }
      }
    );

    res.status(200).json({
      message: 'All notifications marked as read'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const Notification = (sequelize as any).models.Notification;

    const count = await Notification.count({
      where: { userId, read: false }
    });

    res.status(200).json({
      message: 'Unread count retrieved',
      unreadCount: count
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    const Notification = (sequelize as any).models.Notification;
    const notification = await Notification.findByPk(notificationId);

    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.destroy();

    res.status(200).json({
      message: 'Notification deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

export const deleteAllNotifications = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const Notification = (sequelize as any).models.Notification;

    await Notification.destroy({
      where: { userId }
    });

    res.status(200).json({
      message: 'All notifications deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
};
