import express from 'express';
import { getAllReports } from './reports.controller';
import { authenticate } from '../../shared/middleware/authMiddleware';

const router = express.Router();

// All routes are protected by authenticate middleware
router.get('/', authenticate, getAllReports);

export default router;
