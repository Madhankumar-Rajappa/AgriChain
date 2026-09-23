import React, { useState, useEffect, useRef } from 'react';
import { fetchMyNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import { Bell, CheckCheck, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const data = await fetchMyNotifications({ limit: 10 });
      setNotifications(data.items);
      setUnreadCount(data.unread_count);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await markNotificationRead(id);
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition relative"
        title="Notifications"
      >
        <Bell className="w-4 h-4 text-emerald-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-bold text-3xs w-4 h-4 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-3xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n.id, n.is_read)}
                  className={`p-3.5 transition cursor-pointer hover:bg-slate-850 ${
                    n.is_read ? 'bg-slate-900/40 opacity-70' : 'bg-slate-900 font-medium'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-xs font-bold ${n.is_read ? 'text-slate-300' : 'text-slate-100'}`}>
                      {n.title}
                    </h4>
                    <span className="text-3xs text-slate-500 flex items-center gap-1 shrink-0 ml-2">
                      <Clock className="w-3 h-3" /> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
