import { apiClient } from './client';
import type { MatchContract, DashboardResponse, KpiResponse, PaginatedResponse } from '@/types/api';

export const matchingContractsApi = {
  list: (params?: any) =>
    apiClient.get<PaginatedResponse<MatchContract>>('/matching/contracts', { params }).then((r) => r.data),
  detail: (id: string) => apiClient.get<MatchContract>(`/matching/contracts/${id}`).then((r) => r.data),
  complete: (id: string) => apiClient.patch(`/matching/contracts/${id}/complete`).then((r) => r.data),
  cancel: (id: string, dto: any) =>
    apiClient.post(`/matching/contracts/${id}/cancel`, dto).then((r) => r.data),
  addReview: (id: string, dto: any) =>
    apiClient.post(`/matching/contracts/${id}/review`, dto).then((r) => r.data),
  getDashboard: () =>
    apiClient.get<DashboardResponse>('/matching/contracts/dashboard').then((r) => r.data),
  getKpi: (companyId?: string) =>
    apiClient.get<KpiResponse>('/matching/contracts/kpi', { params: companyId ? { companyId } : {} }).then((r) => r.data),
};
