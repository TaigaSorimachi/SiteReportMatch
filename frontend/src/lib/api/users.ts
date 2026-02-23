import { apiClient } from './client';
import type { User, PaginatedResponse } from '@/types/api';

export const usersApi = {
  create: (dto: any) => apiClient.post<User>('/users', dto).then((r) => r.data),
  list: (params?: any) => apiClient.get<PaginatedResponse<User>>('/users', { params }).then((r) => r.data),
  detail: (id: string) => apiClient.get<User>(`/users/${id}`).then((r) => r.data),
  update: (id: string, dto: any) => apiClient.patch<User>(`/users/${id}`, dto).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/users/${id}`),
  updateAvailability: (id: string, dto: any) =>
    apiClient.patch(`/users/${id}/availability`, dto).then((r) => r.data),
};
