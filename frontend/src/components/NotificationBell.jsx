import React, { useState, useEffect, useRef } from 'react';
import { fetchMyNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import { Bell, CheckCheck, Clock } from 'lucide-react';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
    const interval = setInterval(loadNotifications, 30000);
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
        className="p-2 rounded-xl bg-white hover:bg-[#F5F8F3] text-[#123524] border border-[#DDE8DF] transition relative shadow-2xs"
        title="Notifications"
      >
        <Bell className="w-4 h-4 text-[#075B2A]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#16A34A] text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#DDE8DF] rounded-2xl shadow-elevated z-50 overflow-hidden">
          <div className="p-3.5 bg-[#F7FAF5] border-b border-[#DDE8DF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#075B2A]" />
              <span className="text-xs font-bold text-[#123524]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF]">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-[#075B2A] hover:text-[#0B7A36] flex items-center gap-1 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#EBF2ED]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-[#66756B] text-xs">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n.id, n.is_read)}
                  className={`p-3.5 transition cursor-pointer hover:bg-[#F7FAF5] ${
                    n.is_read ? 'bg-white opacity-70' : 'bg-[#F7FAF5]/50 font-medium'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-xs font-bold ${n.is_read ? 'text-[#66756B]' : 'text-[#123524]'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-[#66756B] flex items-center gap-1 shrink-0 ml-2">
                      <Clock className="w-3 h-3" /> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-[#66756B] line-clamp-2 leading-relaxed">{n.message}</p>
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
