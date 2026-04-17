import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../../models';
import { getSocketIO } from '../../services/socketService';
import {
  getRequestBaseUrl,
  normalizeWastePostPayload
} from '../../utils/wastePostNormalization';

const getConversationIncludes = (User: any, WastePost: any) => [
  { model: User, as: 'participant1', attributes: ['id', 'email', 'businessName', 'companyName', 'type'] },
  { model: User, as: 'participant2', attributes: ['id', 'email', 'businessName', 'companyName', 'type'] },
  {
    model: WastePost,
    as: 'wastePost',
    required: false,
    attributes: ['id', 'title', 'description', 'quantity', 'unit', 'location', 'price', 'images', 'status']
  }
];

const getDisplayName = (user: any) =>
  user?.businessName || user?.companyName || user?.email || 'User';

const enrichConversation = async (conversation: any, Message: any, baseUrl: string) => {
  if (!conversation) {
    return null;
  }

  const latestMessage = await Message.findOne({
    where: { conversationId: conversation.id },
    attributes: ['id', 'conversationId', 'senderId', 'recipientId', 'content', 'imageUrl', 'createdAt'],
    order: [['createdAt', 'DESC'], ['id', 'DESC']]
  });

  const plainConversation = conversation.get({ plain: true });
  const wastePost = plainConversation.wastePost
    ? normalizeWastePostPayload(plainConversation.wastePost, baseUrl)
    : null;

  return {
    ...plainConversation,
    wastePost,
    lastMessage: latestMessage?.content || null,
    lastMessageData: latestMessage ? latestMessage.get({ plain: true }) : null
  };
};

const enrichConversations = async (conversations: any[], Message: any, baseUrl: string) =>
  Promise.all(conversations.map((conversation) => enrichConversation(conversation, Message, baseUrl)));

export const getConversations = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const Conversation = (sequelize as any).models.Conversation;
    const User = (sequelize as any).models.User;
    const WastePost = (sequelize as any).models.WastePost;
    const Message = (sequelize as any).models.Message;
    const baseUrl = getRequestBaseUrl(req);

    const { count, rows } = await Conversation.findAndCountAll({
      where: { [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }] },
      include: getConversationIncludes(User, WastePost),
      limit: limitNum,
      offset,
      order: [['lastMessageAt', 'DESC'], ['updatedAt', 'DESC'], ['id', 'DESC']]
    });

    const data = await enrichConversations(rows, Message, baseUrl);

    res.status(200).json({
      message: 'Conversations retrieved',
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
      data
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const createConversation = async (req: Request, res: Response): Promise<any> => {
  try {
    const participant1Id = req.user?.id;
    const participant2Id = parseInt(req.body.participant2Id, 10);
    const wastePostId = req.body.wastePostId ? parseInt(req.body.wastePostId, 10) : null;

    if (!participant1Id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!participant2Id) {
      return res.status(400).json({ error: 'participant2Id is required' });
    }

    if (participant1Id === participant2Id) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    const Conversation = (sequelize as any).models.Conversation;
    const User = (sequelize as any).models.User;
    const WastePost = (sequelize as any).models.WastePost;
    const Message = (sequelize as any).models.Message;
    const Notification = (sequelize as any).models.Notification;
    const baseUrl = getRequestBaseUrl(req);

    const participant2 = await User.findByPk(participant2Id, {
      attributes: ['id', 'email', 'businessName', 'companyName', 'type']
    });

    if (!participant2) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { participant1Id, participant2Id },
          { participant1Id: participant2Id, participant2Id: participant1Id }
        ]
      }
    });

    const isNewConversation = !conversation;

    if (!conversation) {
      conversation = await Conversation.create({
        participant1Id,
        participant2Id,
        wastePostId: wastePostId || null
      });
    } else if (wastePostId && !conversation.wastePostId) {
      await conversation.update({ wastePostId });
    }

    const hydratedConversation = await Conversation.findByPk(conversation.id, {
      include: getConversationIncludes(User, WastePost)
    });
    const data = await enrichConversation(hydratedConversation, Message, baseUrl);

    if (isNewConversation) {
      const initiator = await User.findByPk(participant1Id, {
        attributes: ['id', 'email', 'businessName', 'companyName', 'type']
      });
      const initiatorName = getDisplayName(initiator);

      await Notification.create({
        userId: participant2Id,
        type: 'MESSAGE',
        title: `New conversation from ${initiatorName}`,
        message: `${initiatorName} started a new conversation with you.`,
        relatedId: conversation.id,
        read: false
      });

      const io = getSocketIO();

      if (io) {
        const payload = {
          conversationId: conversation.id,
          lastMessageAt: conversation.lastMessageAt,
          lastMessage: null
        };

        io.to(`user:${participant1Id}`).emit('conversation:updated', payload);
        io.to(`user:${participant2Id}`).emit('conversation:updated', payload);
        io.to(`user:${participant2Id}`).emit('notification:new', {
          type: 'MESSAGE',
          title: `New conversation from ${initiatorName}`,
          message: `${initiatorName} started a new conversation with you.`,
          relatedId: conversation.id,
          conversationId: conversation.id
        });
      }
    }

    res.status(isNewConversation ? 201 : 200).json({
      message: 'Conversation created/retrieved',
      data
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

export const getConversationById = async (req: Request, res: Response): Promise<any> => {
  try {
    const conversationId = parseInt(req.params.conversationId, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const Conversation = (sequelize as any).models.Conversation;
    const User = (sequelize as any).models.User;
    const WastePost = (sequelize as any).models.WastePost;
    const Message = (sequelize as any).models.Message;
    const baseUrl = getRequestBaseUrl(req);

    const conversation = await Conversation.findByPk(conversationId, {
      include: getConversationIncludes(User, WastePost)
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this conversation' });
    }

    const data = await enrichConversation(conversation, Message, baseUrl);

    res.status(200).json({
      message: 'Conversation retrieved',
      data
    });
  } catch (error: any) {
    console.error('[Conversation Controller] Error fetching conversation:', error.message);
    res.status(500).json({ error: 'Failed to fetch conversation', details: error.message });
  }
};
