import express, { Router } from 'express';
import * as materialController from './material.controller';
import { RateLimiter } from '../../middleware/rateLimiter';

const router: Router = express.Router();

// POST - Create material
router.post('/', RateLimiter.middleware('createMaterial'), materialController.createMaterial);

// GET - Get all materials
router.get('/', materialController.getAllMaterials);

// GET - Get recommended materials
router.get('/recommended', materialController.getRecommendedMaterials);

// GET - Get material by ID
router.get('/:id', materialController.getMaterialById);

// GET - Get materials by type
router.get('/type/:materialType', materialController.getMaterialsByType);

// PUT - Update material
router.put('/:id', materialController.updateMaterial);

// DELETE - Delete material
router.delete('/:id', materialController.deleteMaterial);

export default router;
