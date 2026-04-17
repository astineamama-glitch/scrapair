import express from 'express';
import * as notificationController from './notification.controller';
import { authenticateUser } from '../../middleware/userAuthMiddleware';

const router = express.Router();
router.use(authenticateUser);

router.get('/', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:notificationId/read', notificationController.markAsRead);
router.delete('/delete-all', notificationController.deleteAllNotifications);
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;
