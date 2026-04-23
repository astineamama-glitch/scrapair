/**
 * Feedback Routes
 * Admin backend feedback endpoints
 */

import express from 'express';
import * as feedbackController from './feedback.controller';
import { authenticate } from '../../shared/middleware/authMiddleware';

const router = express.Router();

// All routes are protected by authenticate middleware
router.use(authenticate);

/**
 * GET /feedback
 * Get all feedback with optional filters and pagination
 * Query params: page, limit, rating, type, fromUserType, toUserType, startDate, endDate
 */
router.get('/', feedbackController.getAllFeedback);

/**
 * GET /feedback/stats
 * Get feedback statistics and aggregations
 */
router.get('/stats', feedbackController.getFeedbackStats);

export default router;
