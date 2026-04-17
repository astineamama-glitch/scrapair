import express from 'express';
import * as conversationController from './conversation.controller';
import { authenticateUser } from '../../middleware/userAuthMiddleware';

const router = express.Router();
router.use(authenticateUser);

router.get('/', conversationController.getConversations);
router.post('/', conversationController.createConversation);
router.get('/:conversationId', conversationController.getConversationById);

export default router;
