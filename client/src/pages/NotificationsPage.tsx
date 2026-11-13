import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Armchair,
  BookMarked,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import api from '../api/client';
import { NotificationItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatIndianDateTime } from '../utils/formatters';

export const NotificationsPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      refreshUser();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      refreshUser();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'RESERVATION':
        return <Armchair className="w-5 h-5 text-sky-500" />;
      case 'BORROWING':
        return <BookMarked className="w-5 h-5 text-blue-500" />;
      case 'ALERT':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold border border-sky-100 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>In-App Alerts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Notifications & Updates
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Stay informed about desk reservation confirmations, borrowing approvals, and return deadlines.
            </p>
          </div>

          {notifications.some(n => !n.isRead) && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors self-start sm:self-auto shadow-soft-sm"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Bell className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No notifications yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You are all caught up! When you reserve seats or request books, you'll see alerts here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 ${
                  notif.isRead
                    ? 'bg-white border-slate-200 shadow-soft-sm opacity-85'
                    : 'bg-white border-sky-300 shadow-soft-md ring-1 ring-sky-200'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center space-x-3 pt-1 text-[11px] text-slate-400">
                      <span>{formatIndianDateTime(notif.createdAt)}</span>
                      {notif.linkUrl && (
                        <Link
                          to={notif.linkUrl}
                          className="font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
                        >
                          <span>View Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!notif.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 shrink-0"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
