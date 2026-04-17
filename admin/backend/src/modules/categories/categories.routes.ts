import express from 'express';
import * as categoriesController from './categories.controller';
import { authenticate } from '../../shared/middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticate, categoriesController.getWasteCategories);
router.post('/', authenticate, categoriesController.createWasteCategory);
router.put('/:categoryId', authenticate, categoriesController.updateWasteCategory);
router.delete('/:categoryId', authenticate, categoriesController.deleteWasteCategory);

export default router;
