import express from 'express';
import * as collectionController from './collection.controller';
import { authenticateUser } from '../../middleware/userAuthMiddleware';
import { RateLimiter } from '../../middleware/rateLimiter';

const router = express.Router();

router.get('/available', collectionController.getAvailablePosts);
router.get('/', authenticateUser, collectionController.getUserCollections);
router.get('/:collectionId', authenticateUser, collectionController.getCollectionById);
router.post('/request', authenticateUser, RateLimiter.middleware('createCollection'), collectionController.requestCollection);
router.put('/:collectionId/approve', authenticateUser, collectionController.approveCollection);
router.put('/:collectionId/schedule', authenticateUser, collectionController.scheduleCollection);
router.put('/:collectionId/reject', authenticateUser, collectionController.rejectCollection);
router.put('/:collectionId/confirm', authenticateUser, collectionController.confirmPickup);
router.put('/:collectionId/confirm-pickup', authenticateUser, collectionController.confirmPickup);
router.put('/:collectionId/accept-materials', authenticateUser, collectionController.acceptMaterials);
router.put('/:collectionId/cancel', authenticateUser, collectionController.cancelCollection);

export default router;
