import { Request, Response } from 'express';
import * as materialService from './material.service';
import CacheService from '../../services/cacheService';

/**
 * POST /materials
 * Create a new material
 */
export const createMaterial = (req: Request, res: Response): any => {
  try {
    const { businessName, materialType, quantity, description, contactEmail } = req.body;

    if (!businessName || !materialType || !quantity || !contactEmail) {
      return res.status(400).json({
        error: 'Missing required fields: businessName, materialType, quantity, contactEmail'
      });
    }

    const material = materialService.addMaterial({
      businessName,
      materialType,
      quantity,
      description,
      contactEmail
    });

    // Invalidate cache on create
    CacheService.invalidateCachePrefix('materials').catch(err =>
      console.error('Failed to invalidate materials cache:', err)
    );

    res.status(201).json({
      message: 'Material posted successfully',
      data: material
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /materials
 * Get all materials with caching
 */
export const getAllMaterials = async (req: Request, res: Response): Promise<any> => {
  try {
    const cacheKey = CacheService.generateCacheKey('materials');
    
    // Try to get from cache first
    const cached = await CacheService.getCached<any[]>(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json({
        message: 'All materials retrieved (from cache)',
        count: cached.length,
        data: cached,
        cached: true
      });
    }

    // Not cached, fetch from service
    res.set('X-Cache', 'MISS');
    const materials = materialService.getAllMaterials();
    
    // Cache the result for 1 hour
    CacheService.setCached(cacheKey, materials, 3600).catch(err =>
      console.error('Failed to cache materials:', err)
    );

    res.status(200).json({
      message: 'All materials retrieved',
      count: materials.length,
      data: materials,
      cached: false
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /materials/recommended
 * Get recommended materials for artists
 */
export const getRecommendedMaterials = async (req: Request, res: Response): Promise<any> => {
  try {
    const cacheKey = CacheService.generateCacheKey('materials', 'recommended');
    
    // Try cache
    const cached = await CacheService.getCached<any[]>(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json({
        message: 'Artist recommended materials (from cache)',
        count: cached.length,
        data: cached,
        cached: true
      });
    }

    res.set('X-Cache', 'MISS');
    const recommendedMaterials = materialService.getRecommendedMaterials();
    
    // Cache for 1 hour
    CacheService.setCached(cacheKey, recommendedMaterials, 3600).catch(err =>
      console.error('Failed to cache recommended materials:', err)
    );

    res.status(200).json({
      message: 'Artist recommended materials',
      count: recommendedMaterials.length,
      data: recommendedMaterials,
      cached: false
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /materials/:id
 * Get a single material by ID
 */
export const getMaterialById = (req: Request, res: Response): any => {
  try {
    const { id } = req.params;
    const material = materialService.getMaterialById(parseInt(id));
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.status(200).json({
      message: 'Material retrieved',
      data: material
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /materials/type/:materialType
 * Get materials by type
 */
export const getMaterialsByType = (req: Request, res: Response): any => {
  try {
    const { materialType } = req.params;
    const materials = materialService.getMaterialsByType(materialType);

    res.status(200).json({
      message: `Materials of type ${materialType} retrieved`,
      count: materials.length,
      data: materials
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /materials/:id
 * Delete a material
 */
export const deleteMaterial = (req: Request, res: Response): any => {
  try {
    const { id } = req.params;
    const success = materialService.deleteMaterial(parseInt(id));

    if (!success) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Invalidate cache
    CacheService.invalidateCachePrefix('materials').catch(err =>
      console.error('Failed to invalidate materials cache:', err)
    );

    res.status(200).json({ message: 'Material deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /materials/:id
 * Update a material
 */
export const updateMaterial = (req: Request, res: Response): any => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updated = materialService.updateMaterial(parseInt(id), updates);

    if (!updated) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Invalidate cache
    CacheService.invalidateCachePrefix('materials').catch(err =>
      console.error('Failed to invalidate materials cache:', err)
    );

    res.status(200).json({
      message: 'Material updated successfully',
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
