import { Request, Response } from 'express';
import { sequelize } from '../../shared/db/index';
import {
  logCategoryCreated,
  logCategoryUpdated,
  logCategoryDeleted
} from '../../shared/utils/auditLogger';

const NODE_ENV = process.env.NODE_ENV || 'development';

const getWasteCategories = async (req: Request, res: Response): Promise<any> => {
  try {
    const WasteCategory = (sequelize as any).models.WasteCategory;

    const categories = await WasteCategory.findAll({
      attributes: ['id', 'name', 'description', 'icon', 'isActive'],
      order: [['name', 'ASC']],
      raw: true
    });

    res.status(200).json({
      message: 'Waste categories retrieved successfully',
      data: categories
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: 'Failed to fetch categories',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const createWasteCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const WasteCategory = (sequelize as any).models.WasteCategory;
    const category = await WasteCategory.create({
      name,
      description: description || '',
      icon: icon || '',
      isActive: true
    });

    // Log category creation
    await logCategoryCreated(
      1,
      category.id as any,
      category.name,
      req
    );

    res.status(201).json({
      message: 'Category created successfully',
      data: category
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error creating category', 
      error: 'Failed to create category',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const updateWasteCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { categoryId } = req.params;
    const { name, description, icon, isActive } = req.body;

    const WasteCategory = (sequelize as any).models.WasteCategory;
    const category = await WasteCategory.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      icon: icon !== undefined ? icon : category.icon,
      isActive: isActive !== undefined ? isActive : category.isActive
    });

    // Log category update
    const categoryChanges = {
      name: name !== undefined,
      description: description !== undefined,
      icon: icon !== undefined,
      isActive: isActive !== undefined
    };
    await logCategoryUpdated(
      1,
      category.id as any,
      category.name,
      categoryChanges,
      req
    );

    res.status(200).json({
      message: 'Category updated successfully',
      data: category
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error updating category', 
      error: 'Failed to update category',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const deleteWasteCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { categoryId } = req.params;

    const WasteCategory = (sequelize as any).models.WasteCategory;
    const category = await WasteCategory.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const categoryName = category.name;
    await category.destroy();

    // Log category deletion
    await logCategoryDeleted(
      1,
      category.id as any,
      categoryName,
      req
    );

    res.status(200).json({
      message: 'Category deleted successfully',
      data: { id: categoryId }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error deleting category', 
      error: 'Failed to delete category',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

export {
  getWasteCategories,
  createWasteCategory,
  updateWasteCategory,
  deleteWasteCategory
};
