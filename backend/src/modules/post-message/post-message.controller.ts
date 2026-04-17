// Post Message Module
import { Request, Response } from 'express';
import { sequelize } from '../../models';

export const getPostMessages = async (req: Request, res: Response): Promise<any> => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const PostMessage = (sequelize as any).models.PostMessage;
    const User = (sequelize as any).models.User;

    const { count, rows } = await PostMessage.findAndCountAll({
      where: { postId },
      include: [{ model: User, as: 'author', attributes: ['id', 'email', 'businessName'] }],
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Post messages retrieved',
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
      data: rows
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch post messages' });
  }
};

export const createPostMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { postId, text } = req.body;

    if (!postId || !text) {
      return res.status(400).json({ error: 'postId and text are required' });
    }

    const PostMessage = (sequelize as any).models.PostMessage;

    const message = await PostMessage.create({
      postId,
      authorId: userId,
      text
    });

    res.status(201).json({
      message: 'Post message created successfully',
      data: message
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create post message' });
  }
};

export const updatePostMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { messageId } = req.params;
    const { text } = req.body;

    const PostMessage = (sequelize as any).models.PostMessage;
    const message = await PostMessage.findByPk(messageId);

    if (!message || message.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this message' });
    }

    message.text = text;
    await message.save();

    res.status(200).json({
      message: 'Post message updated successfully',
      data: message
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update post message' });
  }
};

export const deletePostMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { messageId } = req.params;

    const PostMessage = (sequelize as any).models.PostMessage;
    const message = await PostMessage.findByPk(messageId);

    if (!message || message.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await message.destroy();

    res.status(200).json({
      message: 'Post message deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete post message' });
  }
};
