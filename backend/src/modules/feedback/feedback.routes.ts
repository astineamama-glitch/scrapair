import express from 'express';
import * as feedbackController from './feedback.controller';
import { authenticateUser } from '../../middleware/userAuthMiddleware';
import { RateLimiter } from '../../middleware/rateLimiter';

const router = express.Router();
router.use(authenticateUser);

router.post('/', RateLimiter.middleware('createFeedback'), feedbackController.submitFeedback);
router.get('/collection/:collectionId/status', feedbackController.getCollectionFeedbackStatus);
router.get('/user/:userId', feedbackController.getUserFeedback);
router.get('/post/:postId', feedbackController.getPostFeedback);

export default router;
