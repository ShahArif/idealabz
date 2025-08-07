import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    // Optionally: subscribe to real-time updates here
  }, [user]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!error && data) setNotifications(data);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(notifications => notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        onClick={() => setOpen(o => !o)}
        aria-label="Show notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto border">
          <div className="p-4 border-b font-semibold">Notifications</div>
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500">No notifications</div>
          ) : (
            <ul>
              {notifications.map(n => (
                <li
                  key={n.id}
                  className={`px-4 py-3 border-b last:border-b-0 flex items-start gap-2 cursor-pointer hover:bg-gray-50 ${!n.read ? 'bg-blue-50' : ''}`}
                  onClick={() => { if (!n.read) markAsRead(n.id); }}
                >
                  <div className="flex-1">
                    {n.link ? (
                      <Link to={n.link} className="font-medium text-blue-600 hover:underline" onClick={() => markAsRead(n.id)}>
                        {n.message}
                      </Link>
                    ) : (
                      <span>{n.message}</span>
                    )}
                    <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  {!n.read && <span className="ml-2 mt-1 w-2 h-2 rounded-full bg-blue-500" />}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
