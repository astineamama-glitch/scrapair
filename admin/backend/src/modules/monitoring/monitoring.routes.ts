import express from 'express';
import { getSystemLogs, clearSystemLogs } from './monitoring.controller';
import { authenticate } from '../../shared/middleware/authMiddleware';

const router = express.Router();

// All routes are protected by authenticate middleware
router.get('/logs', authenticate, getSystemLogs);
router.delete('/logs', authenticate, clearSystemLogs);

export default router;
