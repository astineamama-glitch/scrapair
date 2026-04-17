import express from 'express';
import * as wastePostController from './waste-post.controller';
import { authenticateUser } from '../../middleware/userAuthMiddleware';
import { RateLimiter } from '../../middleware/rateLimiter';

const router = express.Router();

router.get('/categories', wastePostController.getWasteCategories);
router.get('/user/mine', authenticateUser, wastePostController.getUserWastePosts);
router.get('/my-approved', authenticateUser, wastePostController.getMyApprovedCollections);
router.get('/', wastePostController.getWastePosts);
router.post('/', authenticateUser, RateLimiter.middleware('createWastePost'), wastePostController.createWastePost);
router.get('/:postId', wastePostController.getWastePostById);
router.put('/:postId', authenticateUser, wastePostController.updateWastePost);
router.delete('/:postId', authenticateUser, wastePostController.deleteWastePost);

export default router;
