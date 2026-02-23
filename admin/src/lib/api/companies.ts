import { apiClient } from './client';
import type { Company, PaginatedResponse } from '@/types/api';

export const companiesApi = {
  create: (dto: Record<string, unknown>) =>
    apiClient.post<Company>('/companies', dto).then((r) => r.data),
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<Company>>('/companies', { params }).then((r) => r.data),
  detail: (id: string) =>
    apiClient.get<Company>(`/companies/${id}`).then((r) => r.data),
  update: (id: string, dto: Record<string, unknown>) =>
    apiClient.patch<Company>(`/companies/${id}`, dto).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete(`/companies/${id}`),
};
