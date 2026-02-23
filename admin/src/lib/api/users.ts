import { apiClient } from './client';
import type { User, PaginatedResponse } from '@/types/api';

export const usersApi = {
  create: (dto: Record<string, unknown>) =>
    apiClient.post<User>('/users', dto).then((r) => r.data),
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params }).then((r) => r.data),
  detail: (id: string) =>
    apiClient.get<User>(`/users/${id}`).then((r) => r.data),
  update: (id: string, dto: Record<string, unknown>) =>
    apiClient.patch<User>(`/users/${id}`, dto).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete(`/users/${id}`),
};
