import { Server as SocketIOServer, Socket } from 'socket.io';
import redisClient from '../config/redis';
import { RateLimiter } from '../middleware/rateLimiter';
import { Message, Conversation, User, Notification } from '../models';
import { verifyUserToken } from '../config/userJwt';

interface CustomSocket extends Socket {
  userId?: number;
  userType?: string;
  userName?: string;
}

let globalIo: SocketIOServer | null = null;

const emitSocketError = (socket: CustomSocket, message: string) => {
  socket.emit('socket:error', { message });
};

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

const emitConversationUpdate = (io: SocketIOServer, conversation: any, lastMessage: string | null) => {
  const payload = {
    conversationId: conversation.id,
    lastMessageAt: conversation.lastMessageAt,
    lastMessage
  };

  io.to(`user:${conversation.participant1Id}`).emit('conversation:updated', payload);
  io.to(`user:${conversation.participant2Id}`).emit('conversation:updated', payload);
  io.to(`conversation:${conversation.id}`).emit('conversation:updated', payload);
};

export function getSocketIO(): SocketIOServer | null {
  return globalIo;
}

export function initializeSocket(io: SocketIOServer) {
  globalIo = io;

  io.use(async (socket: CustomSocket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        socket.userId = undefined;
        next();
        return;
      }

      const decoded = verifyUserToken(token);

      if (!decoded) {
        return next(new Error('Invalid or expired token'));
      }

      socket.userId = decoded.id;
      socket.userType = decoded.type;
      socket.userName = decoded.businessName || decoded.companyName || decoded.email;

      next();
    } catch (error: any) {
      next();
    }
  });

  io.on('connection', async (socket: CustomSocket) => {
    const requireAuth = () => {
      if (!socket.userId) {
        emitSocketError(socket, 'Not authenticated. Please login first.');
        return false;
      }

      return true;
    };

    const getAuthorizedConversation = async (conversationId: number) => {
      const conversation = await Conversation.findByPk(conversationId);

      if (!conversation) {
        emitSocketError(socket, 'Conversation not found');
        return null;
      }

      const isParticipant =
        conversation.participant1Id === socket.userId || conversation.participant2Id === socket.userId;

      if (!isParticipant) {
        emitSocketError(socket, 'Not authorized to access conversation');
        return null;
      }

      return conversation;
    };

    if (socket.userId) {
      try {
        await redisClient.hset(`user:${socket.userId}:sockets`, socket.id, new Date().toISOString());
        await redisClient.expire(`user:${socket.userId}:sockets`, 30 * 24 * 60 * 60);
      } catch (redisError) {
      }

      socket.join(`user:${socket.userId}`);

      try {
        io.emit('user:online', {
          userId: socket.userId,
          timestamp: new Date()
        });
      } catch (broadcastError) {
      }

      try {
        await redisClient.setex(
          `user:online:${socket.userId}`,
          300,
          JSON.stringify({
            socketId: socket.id,
            lastSeen: new Date().getTime()
          })
        );
      } catch (redisError) {
      }
    }

    socket.on('conversation:join', async (conversationId: number) => {
      try {
        if (!requireAuth()) {
          return;
        }

        const normalizedConversationId = Number(conversationId);

        if (Number.isNaN(normalizedConversationId)) {
          emitSocketError(socket, 'Conversation not found');
          return;
        }

        const conversation = await getAuthorizedConversation(normalizedConversationId);

        if (!conversation) {
          return;
        }

        socket.join(`conversation:${normalizedConversationId}`);
      } catch (error) {
        emitSocketError(socket, 'Failed to join conversation');
      }
    });

    socket.on('conversation:leave', (conversationId: number) => {
      if (!requireAuth()) {
        return;
      }

      const normalizedConversationId = Number(conversationId);

      if (!Number.isNaN(normalizedConversationId)) {
        socket.leave(`conversation:${normalizedConversationId}`);
      }
    });

    socket.on('message:typing', async (conversationId: number) => {
      try {
        if (!requireAuth()) {
          return;
        }

        const normalizedConversationId = Number(conversationId);
        const conversation = await getAuthorizedConversation(normalizedConversationId);

        if (!conversation) {
          return;
        }

        const allowed = await RateLimiter.checkLimit(
          socket.userId!.toString(),
          socket.handshake.address || 'unknown',
          'typing'
        );

        if (!allowed) {
          emitSocketError(socket, 'Typing rate limit exceeded');
          return;
        }

        const typingKey = `typing:${normalizedConversationId}`;
        await redisClient.hset(typingKey, socket.userId!.toString(), Date.now().toString());
        await redisClient.expire(typingKey, 3);

        socket.to(`conversation:${normalizedConversationId}`).emit('user:typing', {
          userId: socket.userId,
          userName: socket.userName,
          conversationId: normalizedConversationId
        });
      } catch (error) {
      }
    });

    socket.on('message:stop-typing', async (conversationId: number) => {
      try {
        if (!requireAuth()) {
          return;
        }

        const normalizedConversationId = Number(conversationId);
        const conversation = await getAuthorizedConversation(normalizedConversationId);

        if (!conversation) {
          return;
        }

        const typingKey = `typing:${normalizedConversationId}`;
        await redisClient.hdel(typingKey, socket.userId!.toString());

        socket.to(`conversation:${normalizedConversationId}`).emit('user:stop-typing', {
          userId: socket.userId,
          conversationId: normalizedConversationId
        });
      } catch (error) {
      }
    });

    socket.on('message:send', async (data: any) => {
      try {
        if (!requireAuth()) {
          return;
        }

        const conversationId = Number(data?.conversationId);
        const requestedRecipientId = data?.recipientId ? Number(data.recipientId) : null;
        const content = typeof data?.content === 'string' ? data.content.trim() : '';
        const imageUrl = data?.imageUrl || null;

        if (!conversationId || (!content && !imageUrl)) {
          emitSocketError(socket, 'Missing required fields');
          return;
        }

        if (content.length > 5000) {
          emitSocketError(socket, 'Message exceeds maximum length');
          return;
        }

        const conversation = await getAuthorizedConversation(conversationId);

        if (!conversation) {
          return;
        }

        const recipientId =
          conversation.participant1Id === socket.userId ? conversation.participant2Id : conversation.participant1Id;

        if (requestedRecipientId && requestedRecipientId !== recipientId) {
          emitSocketError(socket, 'Recipient does not match this conversation');
          return;
        }

        const allowed = await RateLimiter.checkLimit(
          socket.userId!.toString(),
          socket.handshake.address || 'unknown',
          'sendMessage'
        );

        if (!allowed) {
          emitSocketError(socket, 'Message rate limit exceeded');
          return;
        }

        const sender = await User.findByPk(socket.userId!, {
          attributes: ['id', 'email', 'businessName', 'companyName', 'type']
        });
        const senderName = getDisplayName(sender);

        const message = await Message.create({
          conversationId,
          senderId: socket.userId!,
          recipientId,
          content,
          imageUrl
        });

        await conversation.update({ lastMessageAt: message.createdAt });

        const cacheKey = `conversation:${conversationId}:messages`;
        await redisClient.zadd(cacheKey, Date.now(), JSON.stringify(message.toJSON()));
        await redisClient.expire(cacheKey, 24 * 60 * 60);

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

        io.to(`conversation:${conversationId}`).emit('message:received', payload);
        emitConversationUpdate(io, conversation, preview);

        io.to(`user:${recipientId}`).emit('notification:new', {
          type: 'MESSAGE',
          title: `Message from ${senderName}`,
          message: preview,
          relatedId: message.id,
          conversationId
        });

        await redisClient.hdel(`typing:${conversationId}`, socket.userId!.toString());

        socket.emit('message:sent', { id: message.id, conversationId });
      } catch (error) {
        emitSocketError(socket, 'Failed to send message');
      }
    });

    socket.on('disconnect', async () => {
      try {
        if (!socket.userId) {
          return;
        }

        await redisClient.hdel(`user:${socket.userId}:sockets`, socket.id);

        const remainingSockets = await redisClient.hlen(`user:${socket.userId}:sockets`);

        if (remainingSockets === 0) {
          await redisClient.del(`user:online:${socket.userId}`);
          io.emit('user:offline', {
            userId: socket.userId,
            timestamp: new Date()
          });
        }
      } catch (error) {
      }
    });
  });

  return io;
}

export default initializeSocket;
