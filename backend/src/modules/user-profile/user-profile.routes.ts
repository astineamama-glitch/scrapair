import express from 'express';
import * as userProfileController from './user-profile.controller';
import { authenticateUser } from '../../middleware/userAuthMiddleware';

const router = express.Router();
router.use(authenticateUser);

router.get('/profile', userProfileController.getUserProfile);
router.put('/profile', userProfileController.updateUserProfile);
router.post('/change-password', userProfileController.changePassword);
router.delete('/account', userProfileController.deleteUserAccount);

export default router;
