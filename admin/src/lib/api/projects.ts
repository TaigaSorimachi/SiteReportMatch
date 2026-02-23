import { apiClient } from './client';
import type { Project, PaginatedResponse } from '@/types/api';

export const projectsApi = {
  create: (dto: Record<string, unknown>) =>
    apiClient.post<Project>('/projects', dto).then((r) => r.data),
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<Project>>('/projects', { params }).then((r) => r.data),
  detail: (id: string) =>
    apiClient.get<Project>(`/projects/${id}`).then((r) => r.data),
  update: (id: string, dto: Record<string, unknown>) =>
    apiClient.patch<Project>(`/projects/${id}`, dto).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete(`/projects/${id}`),
};
