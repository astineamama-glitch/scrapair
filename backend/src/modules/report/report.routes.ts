import express from 'express';
import * as reportController from './report.controller';
import { authenticateUser } from '../../middleware/userAuthMiddleware';

const router = express.Router();
router.use(authenticateUser);

router.post('/', reportController.submitReport);
router.get('/my-reports', reportController.getUserReports);
router.get('/admin/pending', reportController.getPendingReports);
router.get('/admin/all', reportController.getAllReports);
router.put('/admin/:reportId/approve', reportController.approveReport);
router.put('/admin/:reportId/reject', reportController.rejectReport);

export default router;
