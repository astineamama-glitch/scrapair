import { Request, Response } from 'express';
import { sequelize } from '../../models';
import { getSocketIO } from '../../services/socketService';

const getDisplayName = (user: any) =>
  user?.businessName || user?.companyName || user?.email || 'User';

const buildMessagePayload = (message: any, sender: any) => ({
  id: message.id,
  conversationId: message.conversationId,
  senderId: message.senderId,
  recipientId: message.recipientId,
  sender: sender
    ? {
        id: sender.id,
        email: sender.email,
        businessName: sender.businessName,
        companyName: sender.companyName,
        type: sender.type,
        name: getDisplayName(sender)
      }
    : undefined,
  content: message.content,
  imageUrl: message.imageUrl,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt
});

const getMessagePreview = (content: string, imageUrl?: string | null) => {
  if (content) {
    return content.substring(0, 100);
  }

  if (imageUrl) {
    return 'Sent an image';
  }

  return 'New message';
};

const getAuthorizedConversation = async (conversationId: number, userId: number, Conversation: any) => {
  const conversation = await Conversation.findByPk(conversationId);

  if (!conversation) {
    return { status: 404, error: 'Conversation not found' };
  }

  if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
    return { status: 403, error: 'Not authorized to access this conversation' };
  }

  return { conversation };
};

const emitConversationUpdate = (io: any, conversation: any, lastMessage: string | null) => {
  const payload = {
    conversationId: conversation.id,
    lastMessageAt: conversation.lastMessageAt,
    lastMessage
  };

  io.to(`user:${conversation.participant1Id}`).emit('conversation:updated', payload);
  io.to(`user:${conversation.participant2Id}`).emit('conversation:updated', payload);
  io.to(`conversation:${conversation.id}`).emit('conversation:updated', payload);
};

export const getMessages = async (req: Request, res: Response): Promise<any> => {
  try {
    const conversationId = parseInt(req.params.conversationId, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const Message = (sequelize as any).models.Message;
    const User = (sequelize as any).models.User;
    const Conversation = (sequelize as any).models.Conversation;

    const access = await getAuthorizedConversation(conversationId, userId, Conversation);

    if (access.error) {
      return res.status(access.status).json({ error: access.error });
    }

    const { count, rows } = await Message.findAndCountAll({
      where: { conversationId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'email', 'businessName', 'companyName', 'type']
        }
      ],
      limit: limitNum,
      offset,
      order: [['createdAt', 'ASC'], ['id', 'ASC']]
    });

    res.status(200).json({
      message: 'Messages retrieved',
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
      data: rows
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const conversationId = parseInt(req.body.conversationId, 10);
    const requestedRecipientId = req.body.recipientId ? parseInt(req.body.recipientId, 10) : null;
    const imageUrl = req.body.imageUrl || null;
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!conversationId || (!content && !imageUrl)) {
      return res.status(400).json({ error: 'conversationId and message content or image are required' });
    }

    if (content.length > 5000) {
      return res.status(400).json({ error: 'Message exceeds maximum length' });
    }

    const Message = (sequelize as any).models.Message;
    const User = (sequelize as any).models.User;
    const Notification = (sequelize as any).models.Notification;
    const Conversation = (sequelize as any).models.Conversation;

    const access = await getAuthorizedConversation(conversationId, userId, Conversation);

    if (access.error) {
      return res.status(access.status).json({ error: access.error });
    }

    const conversation = access.conversation;
    const recipientId =
      conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;

    if (requestedRecipientId && requestedRecipientId !== recipientId) {
      return res.status(400).json({ error: 'Recipient does not match this conversation' });
    }

    const sender = await User.findByPk(userId, {
      attributes: ['id', 'email', 'businessName', 'companyName', 'type']
    });
    const senderName = getDisplayName(sender);

    const message = await Message.create({
      conversationId,
      senderId: userId,
      recipientId,
      content,
      imageUrl
    });

    await conversation.update({ lastMessageAt: message.createdAt });

    const preview = getMessagePreview(content, imageUrl);

    await Notification.create({
      userId: recipientId,
      type: 'MESSAGE',
      title: `Message from ${senderName}`,
      message: preview,
      relatedId: message.id,
      read: false
    });

    const payload = buildMessagePayload(message, sender);
    const io = getSocketIO();

    if (io) {
      io.to(`conversation:${conversationId}`).emit('message:received', payload);
      emitConversationUpdate(io, conversation, preview);
      io.to(`user:${recipientId}`).emit('notification:new', {
        type: 'MESSAGE',
        title: `Message from ${senderName}`,
        message: preview,
        relatedId: message.id,
        conversationId
      });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: payload
    });
  } catch (error: any) {
    console.error('[Message Controller] Error sending message:', error.message);
    console.error('[Message Controller] Stack:', error.stack);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
};

export const updateMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const messageId = parseInt(req.params.messageId, 10);
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    if (content.length > 5000) {
      return res.status(400).json({ error: 'Message exceeds maximum length' });
    }

    const Message = (sequelize as any).models.Message;
    const User = (sequelize as any).models.User;
    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this message' });
    }

    message.content = content;
    await message.save();

    const sender = await User.findByPk(userId, {
      attributes: ['id', 'email', 'businessName', 'companyName', 'type']
    });
    const payload = buildMessagePayload(message, sender);
    const io = getSocketIO();

    if (io) {
      io.to(`conversation:${message.conversationId}`).emit('message:updated', payload);
    }

    res.status(200).json({
      message: 'Message updated successfully',
      data: payload
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update message' });
  }
};

export const markMessageAsRead = async (req: Request, res: Response): Promise<any> => {
  try {
    const messageId = parseInt(req.params.messageId, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const Message = (sequelize as any).models.Message;
    const Conversation = (sequelize as any).models.Conversation;
    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const access = await getAuthorizedConversation(message.conversationId, userId, Conversation);

    if (access.error) {
      return res.status(access.status).json({ error: access.error });
    }

    res.status(200).json({
      message: 'Message retrieved',
      data: message
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to mark message' });
  }
};

export const deleteMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const messageId = parseInt(req.params.messageId, 10);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const Message = (sequelize as any).models.Message;
    const Conversation = (sequelize as any).models.Conversation;
    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    const conversation = await Conversation.findByPk(message.conversationId);
    await message.destroy();

    if (conversation) {
      const latestMessage = await Message.findOne({
        where: { conversationId: conversation.id },
        order: [['createdAt', 'DESC'], ['id', 'DESC']]
      });

      await conversation.update({
        lastMessageAt: latestMessage?.createdAt || conversation.createdAt
      });

      const io = getSocketIO();

      if (io) {
        const preview = getMessagePreview(latestMessage?.content || '', latestMessage?.imageUrl || null);

        io.to(`conversation:${conversation.id}`).emit('message:deleted', {
          id: messageId,
          conversationId: conversation.id
        });
        emitConversationUpdate(io, conversation, latestMessage ? preview : null);
      }
    }

    res.status(200).json({
      message: 'Message deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
