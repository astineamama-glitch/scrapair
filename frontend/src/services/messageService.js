import apiClient from './api';
import {
  normalizeConversation,
  normalizeConversations,
} from '../shared/utils/wastePostNormalizer';

const normalizeUploadPayload = (fileOrFormData) => {
  if (fileOrFormData instanceof FormData) {
    if (fileOrFormData.has('file')) {
      return fileOrFormData;
    }

    const normalized = new FormData();
    const image = fileOrFormData.get('image');

    if (image) {
      normalized.append('file', image);
    }

    return normalized;
  }

  const formData = new FormData();

  if (fileOrFormData) {
    formData.append('file', fileOrFormData);
  }

  return formData;
};

const messageService = {
  _cache: {
    conversations: null,
    conversationTimestamp: 0,
  },

  CACHE_DURATION: 5 * 60 * 1000,

  clearConversationsCache() {
    this._cache.conversations = null;
    this._cache.conversationTimestamp = 0;
  },

  isCacheValid() {
    return (
      Array.isArray(this._cache.conversations) &&
      Date.now() - this._cache.conversationTimestamp < this.CACHE_DURATION
    );
  },

  startConversation: async (participantUserId, wastePostId) => {
    const response = await apiClient.post('/conversations', {
      participant2Id: participantUserId,
      wastePostId,
    });

    messageService.clearConversationsCache();
    return normalizeConversation(response.data.data);
  },

  getConversations: async (ignoreCache = false) => {
    if (!ignoreCache && messageService.isCacheValid()) {
      return messageService._cache.conversations;
    }

    const response = await apiClient.get('/conversations');
    const conversations = normalizeConversations(
      Array.isArray(response.data.data) ? response.data.data : []
    );

    messageService._cache.conversations = conversations;
    messageService._cache.conversationTimestamp = Date.now();

    return conversations;
  },

  getConversation: async (id) => {
    const response = await apiClient.get(`/conversations/${id}`);
    return normalizeConversation(response.data.data);
  },

  getConversationMessages: async (conversationId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/messages/${conversationId}`, {
      params: { page, limit },
    });

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  sendMessage: async (conversationId, recipientId, content, imageUrl = null) => {
    const response = await apiClient.post('/messages', {
      conversationId,
      recipientId,
      content,
      imageUrl,
    });

    messageService.clearConversationsCache();
    return response.data.data || response.data;
  },

  uploadMessageImage: async (fileOrFormData) => {
    const response = await apiClient.post('/images/upload', normalizeUploadPayload(fileOrFormData));

    return response.data.data || response.data;
  },

  editMessage: async (messageId, content) => {
    const response = await apiClient.put(`/messages/${messageId}`, { content });
    return response.data.data || response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await apiClient.delete(`/messages/${messageId}`);

    messageService.clearConversationsCache();
    return response.data;
  },

  getNotifications: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/notifications', {
      params: { page, limit },
    });
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await apiClient.put(`/notifications/${id}/read`, {});
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await apiClient.put('/notifications/read-all', {});
    return response.data;
  },

  deleteAllNotifications: async () => {
    const response = await apiClient.delete('/notifications/delete-all');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },
};

export default messageService;
