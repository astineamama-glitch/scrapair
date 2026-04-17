import express from 'express';
import * as messageController from './message.controller';
import { authenticateUser } from '../../middleware/userAuthMiddleware';

const router = express.Router();
router.use(authenticateUser);

router.get('/:conversationId', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.put('/:messageId', messageController.updateMessage);
router.put('/:messageId/read', messageController.markMessageAsRead);
router.delete('/:messageId', messageController.deleteMessage);

export default router;
