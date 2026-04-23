import express from 'express';
import { recalculateAllUserRatings, getRatingRecalculationReport } from './maintenance.controller';
import { authenticate } from '../../shared/middleware/authMiddleware';

const router = express.Router();

// All routes are protected by authenticate middleware
router.post('/ratings/recalculate', authenticate, recalculateAllUserRatings);
router.get('/ratings/report', authenticate, getRatingRecalculationReport);

export default router;
