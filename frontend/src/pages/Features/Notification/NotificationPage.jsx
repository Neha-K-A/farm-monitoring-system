import { useEffect, useState } from 'react';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import Card from '../../../components/Common/Card.jsx';
import Button from '../../../components/Common/Button.jsx';
import EmptyState from '../../../components/Common/EmptyState.jsx';
import Loader from '../../../components/Common/Loader.jsx';
import Badge from '../../../components/Common/Badge.jsx';
import { useNotification } from '../../../hooks/useNotification.js';
import notificationService from '../../../services/notificationService.js';
import { Bell, Trash2, Check } from 'lucide-react';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error: notifyError } = useNotification();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      notifyError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      success('Marked as read');
      loadNotifications();
    } catch (err) {
      notifyError('Failed to update notification');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      success('Notification deleted');
      loadNotifications();
    } catch (err) {
      notifyError('Failed to delete notification');
    }
  };

  if (loading) return <Loader />;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-[#1A1A2E] flex items-center gap-3">
              <Bell className="text-[#3498DB]" size={36} />
              Command Center Alerts
            </h1>
            <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Real-time system notifications and critical agricultural event logs.</p>
          </div>
        </div>

        {notifications.length === 0 ? (
          <EmptyState title="No notifications" description="You're all caught up!" />
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Card
                key={notif._id}
                className={`flex items-start justify-between !p-6 border-[#E0E0E0] rounded-2xl transition-all hover:shadow-xl group ${notif.read ? '!bg-white' : '!bg-[#EBF8FF] border-[#BEE3F8] shadow-sm'
                  }`}
              >
                <div className="flex gap-4 flex-1">
                  <div className={`flex-shrink-0 w-3 h-3 mt-1.5 rounded-full shadow-sm ${notif.read ? 'bg-[#CBD5E0]' : 'bg-[#3498DB] animate-pulse'
                    }`} />
                  <div>
                    <p className={`text-lg font-black tracking-tight ${notif.read ? 'text-[#1A1A2E]' : 'text-[#2B6CB0]'}`}>
                      {notif.title}
                    </p>
                    <p className={`text-sm mt-2 leading-relaxed ${notif.read ? 'text-[#636E72] font-medium' : 'text-[#2B6CB0] font-bold'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${notif.read ? 'text-[#A0AEC0]' : 'text-[#3498DB]'}`}>
                        {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 ml-6">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="w-10 h-10 rounded-xl bg-white border border-[#BEE3F8] flex items-center justify-center text-[#3498DB] hover:bg-[#3498DB] hover:text-white transition-all shadow-sm active:scale-95"
                      title="Mark as read"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif._id)}
                    className="w-10 h-10 rounded-xl bg-white border border-[#E0E0E0] flex items-center justify-center text-[#E53E3E] hover:bg-[#E53E3E] hover:text-white transition-all shadow-sm active:scale-95"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NotificationPage;
