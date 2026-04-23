import express from 'express';
import {
  getAllUserRatings,
  getAllPostRatings,
  getUserRatingHistory,
  getUserRatingStats,
  adjustUserRatingManually,
  recalculateRating
} from './ratings.controller';
import { authenticate } from '../../shared/middleware/authMiddleware';

const router = express.Router();

// All routes are protected by authenticate middleware

// User ratings endpoints
router.get('/users', authenticate, getAllUserRatings);
router.get('/users/:userId/history', authenticate, getUserRatingHistory);
router.get('/users/:userId/stats', authenticate, getUserRatingStats);
router.put('/users/:userId/adjust', authenticate, adjustUserRatingManually);
router.post('/users/:userId/recalculate', authenticate, recalculateRating);

// Post ratings endpoints
router.get('/posts', authenticate, getAllPostRatings);

export default router;
