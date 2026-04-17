/* eslint-disable unicode-bom */
import io from 'socket.io-client';

// Determine socket URL based on environment
const determineSocketUrl = () => {
  // If explicit env var is set, use it
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }

  // Warn if not configured
  if (typeof window !== 'undefined') {
    console.warn('REACT_APP_SOCKET_URL is not defined, falling back to current origin');
  }

  // If in browser, use the same domain as the frontend
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  console.error('REACT_APP_SOCKET_URL must be set for server-side socket connections');
  return undefined;
};

const SOCKET_URL = determineSocketUrl();

const getSocketErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.error) {
    return error.error;
  }

  return 'Unknown error';
};

class SocketService {
  constructor() {
    this.socket = null;
    this.firstConnectErrorLogged = false;
  }

  connect(token) {
    if (this.socket) {
      this.socket.auth = {
        token,
      };

      if (!this.socket.connected) {
        this.socket.connect();
      }
      return this.socket;
    }

    if (!token) {
      return null;
    }

    try {
      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket'],
        path: '/socket.io',
      });

      this.socket.on('connect', () => {
        this.firstConnectErrorLogged = false;
        console.log('[Socket] ✅ WebSocket connected');
      });

      this.socket.on('disconnect', (reason) => {
        if (reason !== 'io client namespace disconnect') {
          console.warn('[Socket] ❌ Disconnected:', reason);
        }
      });

      this.socket.on('error', (error) => {
        console.error('[Socket] 🚨 Transport error:', getSocketErrorMessage(error));
      });

      this.socket.on('socket:error', (error) => {
        console.error('[Socket] 🚨 App error:', getSocketErrorMessage(error));
      });

      this.socket.on('connect_error', (error) => {
        // Only log first connection error, not every retry
        if (error?.message && !this.firstConnectErrorLogged) {
          console.error('[Socket] ⚠️ Connection failed:', error.message);
          this.firstConnectErrorLogged = true;
        }
      });
    } catch (error) {
      this.socket = null;
      return null;
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  onMessage(callback) {
    this.on('message', callback);
  }

  onNotification(callback) {
    this.on('notification:new', callback);
  }

  onTyping(callback) {
    this.on('typing', callback);
  }

  emitTyping(conversationId) {
    this.emit('typing', { conversationId });
  }

  onUserStatus(callback) {
    this.on('user_status', callback);
  }

  onConversationUpdate(callback) {
    this.on('conversation:updated', callback);
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

const socketService = new SocketService();
export default socketService;

