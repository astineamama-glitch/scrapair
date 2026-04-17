import express from 'express';
import * as ratingController from './rating.controller';
import { authenticateUser } from '../../middleware/userAuthMiddleware';

const router = express.Router();
router.use(authenticateUser);

router.get('/post/:postId', ratingController.getPostRating);
router.get('/user/:userId', ratingController.getUserRating);
router.get('/admin/users', ratingController.getAllUserRatings);
router.get('/admin/posts', ratingController.getAllPostRatings);

export default router;
