import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi } from '@/lib/api/notifications';

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    notificationsApi.getUnreadCount(user.id).then((r) => setCount(r.count ?? 0)).catch(() => {});
    const id = setInterval(() => {
      notificationsApi.getUnreadCount(user.id).then((r) => setCount(r.count ?? 0)).catch(() => {});
    }, 60000);
    return () => clearInterval(id);
  }, [user]);

  return (
    <button className="relative p-1" onClick={() => navigate('/settings/notifications')}>
      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
