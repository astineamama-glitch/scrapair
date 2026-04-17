import express from 'express';
import * as reviewController from './review.controller';
import { authenticateUser } from '../../middleware/userAuthMiddleware';
import { RateLimiter } from '../../middleware/rateLimiter';

const router = express.Router();

router.post(
  '/',
  authenticateUser,
  RateLimiter.middleware('createReview'),
  reviewController.createReview
);

router.get(
  '/business/:businessId',
  reviewController.getBusinessReviews
);

router.get(
  '/business/:businessId/rating',
  reviewController.getBusinessRating
);

router.put(
  '/:reviewId',
  authenticateUser,
  reviewController.updateReview
);

router.delete(
  '/:reviewId',
  authenticateUser,
  reviewController.deleteReview
);

export default router;
