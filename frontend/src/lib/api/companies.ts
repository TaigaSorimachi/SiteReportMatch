import { apiClient } from './client';
import type { Company, CompanySettings, PaginatedResponse } from '@/types/api';

export const companiesApi = {
  create: (dto: any) => apiClient.post<Company>('/companies', dto).then((r) => r.data),
  list: (params?: any) => apiClient.get<PaginatedResponse<Company>>('/companies', { params }).then((r) => r.data),
  detail: (id: string) => apiClient.get<Company>(`/companies/${id}`).then((r) => r.data),
  update: (id: string, dto: any) => apiClient.patch<Company>(`/companies/${id}`, dto).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/companies/${id}`),
  getSettings: (id: string) => apiClient.get<CompanySettings>(`/companies/${id}/settings`).then((r) => r.data),
  updateSettings: (id: string, dto: any) =>
    apiClient.patch<CompanySettings>(`/companies/${id}/settings`, dto).then((r) => r.data),
};
