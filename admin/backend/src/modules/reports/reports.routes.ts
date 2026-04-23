import express from 'express';
import {
  getAllReports,
  getReportById,
  confirmReportAsValid,
  confirmReportAsInvalid,
  escalateReportStatus,
  reverseReportValid
} from './reports.controller';
import { authenticate } from '../../shared/middleware/authMiddleware';

const router = express.Router();

// All routes are protected by authenticate middleware
router.get('/', authenticate, getAllReports);
router.get('/:id', authenticate, getReportById);

// Admin action endpoints
router.post('/:id/confirm-valid', authenticate, confirmReportAsValid);
router.post('/:id/confirm-invalid', authenticate, confirmReportAsInvalid);
router.post('/:id/escalate', authenticate, escalateReportStatus);
router.post('/:id/reverse', authenticate, reverseReportValid);

export default router;
