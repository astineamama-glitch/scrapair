import express from 'express';
import * as usersController from './users.controller';
import { authenticate } from '../../shared/middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticate, usersController.getAllUsers);
router.get('/:id', authenticate, usersController.getUserById);
router.put('/:id/verify', authenticate, usersController.toggleUserVerification);
router.delete('/:id', authenticate, usersController.deleteUser);

export default router;
