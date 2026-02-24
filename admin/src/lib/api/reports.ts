import { apiClient } from './client';
import type { DailyReport, PaginatedResponse } from '@/types/api';

export const reportsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<DailyReport>>('/reports', { params }).then((r) => r.data),
  detail: (id: string) =>
    apiClient.get<DailyReport>(`/reports/${id}`).then((r) => r.data),
  approve: (id: string) =>
    apiClient.patch<DailyReport>(`/reports/${id}/approve`).then((r) => r.data),
  reject: (id: string, reason: string) =>
    apiClient.patch<DailyReport>(`/reports/${id}/reject`, { rejectionReason: reason }).then((r) => r.data),
};
