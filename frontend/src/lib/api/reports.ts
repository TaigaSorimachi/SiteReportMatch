import { apiClient } from './client';
import type { DailyReport, PaginatedResponse } from '@/types/api';

export const reportsApi = {
  createBatch: (dto: any) => apiClient.post<DailyReport>('/reports', dto).then((r) => r.data),
  clockIn: (dto: any) => apiClient.post<DailyReport>('/reports/clock-in', dto).then((r) => r.data),
  clockOut: (id: string, dto: any) =>
    apiClient.patch<DailyReport>(`/reports/${id}/clock-out`, dto).then((r) => r.data),
  startBreak: (id: string) => apiClient.post(`/reports/${id}/break/start`).then((r) => r.data),
  endBreak: (id: string) => apiClient.patch(`/reports/${id}/break/end`).then((r) => r.data),
  update: (id: string, dto: any) =>
    apiClient.patch<DailyReport>(`/reports/${id}`, dto).then((r) => r.data),
  submit: (id: string) => apiClient.patch(`/reports/${id}/submit`).then((r) => r.data),
  approve: (id: string) => apiClient.patch(`/reports/${id}/approve`).then((r) => r.data),
  reject: (id: string, reason: string) =>
    apiClient.patch(`/reports/${id}/reject`, { reason }).then((r) => r.data),
  list: (params?: any) =>
    apiClient.get<PaginatedResponse<DailyReport>>('/reports', { params }).then((r) => r.data),
  detail: (id: string) => apiClient.get<DailyReport>(`/reports/${id}`).then((r) => r.data),
  addCost: (id: string, dto: any) =>
    apiClient.post(`/reports/${id}/costs`, dto).then((r) => r.data),
  addPhoto: (id: string, dto: any) =>
    apiClient.post(`/reports/${id}/photos`, dto).then((r) => r.data),
  addSafety: (id: string, dto: any) =>
    apiClient.post(`/reports/${id}/safety`, dto).then((r) => r.data),
};
