// Waste Post Module
import { Request, Response } from 'express';
import { WastePost, User, Review } from '../../models';
import { sequelize } from '../../models';
import {
  getRequestBaseUrl,
  normalizeWastePostList,
  normalizeWastePostPayload
} from '../../utils/wastePostNormalization';

export const getWasteCategories = async (req: Request, res: Response): Promise<any> => {
  try {
    const WasteCategory = (sequelize as any).models.WasteCategory;
    const categories = await WasteCategory.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      message: 'Waste categories retrieved',
      data: categories
    });
  } catch (error: any) {
    console.error('Error fetching waste categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createWastePost = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, description, wasteType, quantity, unit, condition, latitude, longitude, city, address, price, images, imageUrl } = req.body;
    const businessId = req.user?.id;

    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!title || !description || !wasteType || !quantity || !latitude || !longitude || !city || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (req.user?.type !== 'business') {
      return res.status(403).json({ error: 'Only business users can create waste posts' });
    }

    // Handle both imageUrl (single string) and images (array)
    let imageArray = [];
    if (images && Array.isArray(images)) {
      imageArray = images;
    } else if (imageUrl) {
      imageArray = [imageUrl];
    }

    // Construct location from address (required field)
    const location = address;

    const wastePost = await WastePost.create({
      businessId,
      title,
      description,
      wasteType,
      quantity,
      unit: unit || 'kg',
      condition,
      location,
      latitude,
      longitude,
      city,
      address,
      price: price || null,
      images: imageArray,
      status: 'active',
      visibility: 'public'
    });

    const baseUrl = getRequestBaseUrl(req);

    res.status(201).json({
      message: 'Waste post created successfully',
      data: normalizeWastePostPayload(wastePost, baseUrl)
    });
  } catch (error: any) {
    console.error('Error creating waste post:', error);
    res.status(500).json({ error: 'Failed to create waste post' });
  }
};

export const getUserWastePosts = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await WastePost.findAndCountAll({
      where: { businessId: userId },
      include: [{ model: User, as: 'business', attributes: ['id', 'businessName', 'email', 'phone'] }],
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const baseUrl = getRequestBaseUrl(req);

    res.status(200).json({
      message: 'User waste posts retrieved',
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
      data: normalizeWastePostList(rows, baseUrl)
    });
  } catch (error: any) {
    console.error('Error fetching user waste posts:', error);
    res.status(500).json({ error: 'Failed to fetch user waste posts' });
  }
};

export const getWastePosts = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20, wasteType, city, status } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = {};
    if (wasteType) whereClause.wasteType = wasteType;
    if (city) whereClause.city = city;
    if (status) whereClause.status = status;

    const { count, rows } = await WastePost.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'business', attributes: ['id', 'businessName', 'email', 'phone'] }],
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const baseUrl = getRequestBaseUrl(req);

    res.status(200).json({
      message: 'Waste posts retrieved',
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
      data: normalizeWastePostList(rows, baseUrl)
    });
  } catch (error: any) {
    console.error('Error fetching waste posts:', error);
    res.status(500).json({ error: 'Failed to fetch waste posts' });
  }
};

export const getWastePostById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { postId } = req.params;

    const post = await WastePost.findByPk(postId, {
      include: [{ model: User, as: 'business', attributes: ['id', 'businessName', 'email', 'phone'] }]
    });

    if (!post) {
      return res.status(404).json({ error: 'Waste post not found' });
    }

    const baseUrl = getRequestBaseUrl(req);

    res.status(200).json({
      message: 'Waste post retrieved',
      data: normalizeWastePostPayload(post, baseUrl)
    });
  } catch (error: any) {
    console.error('Error fetching waste post:', error);
    res.status(500).json({ error: 'Failed to fetch waste post' });
  }
};

export const updateWastePost = async (req: Request, res: Response): Promise<any> => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    const post = await WastePost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Waste post not found' });
    }

    if (post.businessId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    await post.update(updates);
    const baseUrl = getRequestBaseUrl(req);

    res.status(200).json({
      message: 'Waste post updated successfully',
      data: normalizeWastePostPayload(post, baseUrl)
    });
  } catch (error: any) {
    console.error('Error updating waste post:', error);
    res.status(500).json({ error: 'Failed to update waste post' });
  }
};

export const deleteWastePost = async (req: Request, res: Response): Promise<any> => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    const post = await WastePost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Waste post not found' });
    }

    if (post.businessId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await post.destroy();

    res.status(200).json({
      message: 'Waste post deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting waste post:', error);
    res.status(500).json({ error: 'Failed to delete waste post' });
  }
};

export const getMyApprovedCollections = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await WastePost.findAndCountAll({
      where: { approvedRecyclerId: userId },
      include: [{ model: User, as: 'business', attributes: ['id', 'businessName', 'email', 'phone'] }],
      limit: limitNum,
      offset,
      order: [['updatedAt', 'DESC']]
    });

    const baseUrl = getRequestBaseUrl(req);

    res.status(200).json({
      message: 'Approved collections retrieved',
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
      data: normalizeWastePostList(rows, baseUrl)
    });
  } catch (error: any) {
    console.error('Error fetching approved collections:', error);
    res.status(500).json({ error: 'Failed to fetch approved collections' });
  }
};
