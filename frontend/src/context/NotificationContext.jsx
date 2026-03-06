import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(
    (message, type = 'info', duration = 4000, id = null) => {
      const notificationId = id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const notification = {
        id: notificationId,
        message,
        type,
        timestamp: new Date(),
      };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(notificationId);
        }, duration);
      }

      return notificationId;
    },
    []
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const removeAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const success = (message, duration = 4000) =>
    addNotification(message, 'success', duration);

  const error = (message, duration = 4000) =>
    addNotification(message, 'error', duration);

  const warning = (message, duration = 4000) =>
    addNotification(message, 'warning', duration);

  const info = (message, duration = 4000) =>
    addNotification(message, 'info', duration);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    removeAll,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};
