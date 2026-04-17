import React, { createContext, useState, useContext, useEffect } from 'react';
import messageService from '../services/messageService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, userId, token }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch initial unread count on mount
  useEffect(() => {
    if (userId && token) {
      fetchUnreadCount();
      // Refetch every 30 seconds as fallback
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, token]);

  const fetchUnreadCount = async () => {
    try {
      const response = await messageService.getUnreadCount();
      let unreadValue = 0;
      if (typeof response.data?.unreadCount === 'number') {
        unreadValue = response.data.unreadCount;
      } else if (typeof response.unreadCount === 'number') {
        unreadValue = response.unreadCount;
      } else if (typeof response.data === 'number') {
        unreadValue = response.data;
      }
      setUnreadCount(unreadValue);
    } catch (err) {
    }
  };

  const incrementUnreadCount = () => {
    setUnreadCount((prev) => prev + 1);
  };

  const decrementUnreadCount = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const clearUnreadCount = () => {
    setUnreadCount(0);
  };

  const handleNewNotification = (notification) => {
    incrementUnreadCount();
    // You can also add the notification to the notifications list
    setNotifications((prev) => [notification, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        incrementUnreadCount,
        decrementUnreadCount,
        clearUnreadCount,
        fetchUnreadCount,
        handleNewNotification,
        notifications,
        setNotifications,
        loading,
        setLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;

