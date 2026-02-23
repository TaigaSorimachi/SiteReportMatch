import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi } from '@/lib/api/notifications';
import { formatDateTime } from '@/lib/utils';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { NotificationLog } from '@/types/api';

export function NotificationSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationsApi.list({ userId: user.id, limit: 50 });
      setNotifications(res.data);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await notificationsApi.markAllRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      alert('既読処理に失敗しました');
    }
  };

  const handleClickNotification = async (notification: NotificationLog) => {
    if (!notification.isRead) {
      try {
        await notificationsApi.markRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        );
      } catch {
        // ignore
      }
    }
    if (notification.linkUrl) {
      navigate(notification.linkUrl);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <AppHeader title="通知設定" showBack />
      <PageContainer>
        <div className="space-y-4">
          {unreadCount > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                未読: <span className="font-semibold text-green-700">{unreadCount}件</span>
              </p>
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="!w-auto">
                全て既読
              </Button>
            </div>
          )}

          {notifications.length === 0 && (
            <EmptyState message="通知はありません" />
          )}

          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleClickNotification(n)}
                className={`w-full text-left px-3 py-3.5 transition-colors hover:bg-gray-50 active:bg-gray-100
                  ${!n.isRead ? 'bg-green-50/50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Unread dot */}
                  <div className="pt-1.5 shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        n.isRead ? 'bg-transparent' : 'bg-green-500'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${
                        n.isRead ? 'text-gray-700' : 'font-semibold text-gray-900'
                      }`}
                    >
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
                  </div>

                  {n.linkUrl && (
                    <svg
                      className="w-4 h-4 text-gray-400 shrink-0 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
