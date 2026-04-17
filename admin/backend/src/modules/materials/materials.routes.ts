import express from 'express';
import * as materialsController from './materials.controller';
import { authenticate } from '../../shared/middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticate, materialsController.getAllMaterials);
router.get('/:id', authenticate, materialsController.getMaterialById);
router.post('/', authenticate, materialsController.createMaterial);
router.put('/:id', authenticate, materialsController.updateMaterial);
router.delete('/:id', authenticate, materialsController.deleteMaterial);

export default router;
