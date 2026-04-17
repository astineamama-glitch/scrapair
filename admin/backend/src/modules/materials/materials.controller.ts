import { Request, Response } from 'express';
import { sequelize } from '../../shared/db/index';
import {
  logMaterialCreated,
  logMaterialUpdated,
  logMaterialDeleted
} from '../../shared/utils/auditLogger';
import { Material } from './materials.types';

const NODE_ENV = process.env.NODE_ENV || 'development';

const getAllMaterials = async (req: Request, res: Response): Promise<any> => {
  try {
    const Material = (sequelize as any).models.Material;
    
    if (!Material) {
      return res.status(500).json({ error: 'Material model not initialized' });
    }

    const materials = await Material.findAll({
      attributes: ['id', 'businessUserId', 'materialType', 'quantity', 'unit', 'description', 'contactEmail', 'status', 'isRecommendedForArtists', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
      raw: true
    });

    res.status(200).json({
      message: 'All materials retrieved',
      count: materials.length,
      data: materials
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to fetch materials',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const getMaterialById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const Material = (sequelize as any).models.Material;

    if (!Material) {
      return res.status(500).json({ error: 'Material model not initialized' });
    }

    const material = await Material.findByPk(id, {
      raw: true
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.status(200).json({
      message: 'Material retrieved',
      data: material
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to fetch material',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const createMaterial = async (req: Request, res: Response): Promise<any> => {
  try {
    const { businessUserId, materialType, quantity, unit, description, contactEmail, status, isRecommendedForArtists } = req.body;

    if (!businessUserId || !materialType || !quantity || !contactEmail) {
      return res.status(400).json({
        error: 'Missing required fields: businessUserId, materialType, quantity, contactEmail'
      });
    }

    const Material = (sequelize as any).models.Material;
    if (!Material) {
      return res.status(500).json({ error: 'Material model not initialized' });
    }

    const material = await Material.create({
      businessUserId,
      materialType,
      quantity,
      unit: unit || 'kg',
      description,
      contactEmail,
      status: status || 'available',
      isRecommendedForArtists: isRecommendedForArtists || false
    });

    // Log material creation
    await logMaterialCreated(
      1,
      material.id as any,
      material.materialType,
      material.quantity,
      req
    );

    res.status(201).json({
      message: 'Material created successfully',
      data: material
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to create material',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const updateMaterial = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { businessUserId, materialType, quantity, unit, description, contactEmail, status, isRecommendedForArtists } = req.body;

    const Material = (sequelize as any).models.Material;
    if (!Material) {
      return res.status(500).json({ error: 'Material model not initialized' });
    }

    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    await material.update({
      businessUserId: businessUserId || material.businessUserId,
      materialType: materialType || material.materialType,
      quantity: quantity || material.quantity,
      unit: unit || material.unit,
      description: description || material.description,
      contactEmail: contactEmail || material.contactEmail,
      status: status || material.status,
      isRecommendedForArtists: isRecommendedForArtists !== undefined ? isRecommendedForArtists : material.isRecommendedForArtists
    });

    // Log material update
    const updateChanges = {
      businessUserId: businessUserId !== undefined,
      materialType: materialType !== undefined,
      quantity: quantity !== undefined,
      status: status !== undefined,
      isRecommendedForArtists: isRecommendedForArtists !== undefined
    };
    await logMaterialUpdated(
      1,
      material.id as any,
      material.materialType,
      updateChanges,
      req
    );

    res.status(200).json({
      message: 'Material updated successfully',
      data: material
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to update material',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const deleteMaterial = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const Material = (sequelize as any).models.Material;

    if (!Material) {
      return res.status(500).json({ error: 'Material model not initialized' });
    }

    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const materialType = material.materialType;
    await material.destroy();

    // Log material deletion
    await logMaterialDeleted(
      1,
      id as any,
      materialType,
      req
    );

    res.status(200).json({
      message: 'Material deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to delete material',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

export {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
};
