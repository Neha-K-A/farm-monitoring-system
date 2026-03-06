import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotificationContext } from '../../context/NotificationContext.jsx';

const Toast = () => {
  const { notifications, removeNotification } = useNotificationContext();

  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="text-green-600" size={20} />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <AlertCircle className="text-red-600" size={20} />,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertTriangle className="text-yellow-600" size={20} />,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="text-blue-600" size={20} />,
    },
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md space-y-3 pointer-events-none">
      {notifications.map((notification) => {
        const style = typeStyles[notification.type] || typeStyles.info;
        return (
          <div
            key={notification.id}
            className={`${style.bg} ${style.border} border rounded-lg p-4 flex items-start gap-3 animate-slide-in-left pointer-events-auto`}
          >
            {style.icon}
            <div className="flex-1">
              <p className={`${style.text} text-sm font-medium`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className={`${style.text} hover:opacity-70 transition`}
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
