import express from 'express';
import * as postMessageController from './post-message.controller';
import { authenticateUser } from '../../middleware/userAuthMiddleware';

const router = express.Router();
router.use(authenticateUser);

router.get('/:postId', postMessageController.getPostMessages);
router.post('/', postMessageController.createPostMessage);
router.put('/:messageId', postMessageController.updatePostMessage);
router.delete('/:messageId', postMessageController.deletePostMessage);

export default router;
