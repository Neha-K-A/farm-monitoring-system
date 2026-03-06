import { useNotificationContext } from '../context/NotificationContext.jsx';

export const useNotification = () => {
  return useNotificationContext();
};
