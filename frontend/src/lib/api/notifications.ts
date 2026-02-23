import { apiClient } from './client';
import type { NotificationLog, PaginatedResponse } from '@/types/api';

export const notificationsApi = {
  create: (dto: any) => apiClient.post<NotificationLog>('/notifications', dto).then((r) => r.data),
  list: (params?: any) =>
    apiClient.get<PaginatedResponse<NotificationLog>>('/notifications', { params }).then((r) => r.data),
  getUnreadCount: (userId: string) =>
    apiClient.get<{ count: number }>('/notifications/unread-count', { params: { userId } }).then((r) => r.data),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: (userId: string) =>
    apiClient.patch('/notifications/read-all', null, { params: { userId } }).then((r) => r.data),
};
